import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import type { ProcessedSegment, VideoSegment } from '../types'
import { buildSegmentFileName } from '../utils/outputFileName'
import { clampRatio } from '../utils/clampRatio'

/**
 * Núcleo de FFmpeg (single-thread) servido desde un CDN público.
 *
 * Decisión: se carga desde jsDelivr en vez de auto-alojarlo en /public,
 * porque el binario pesa ~31MB y no tiene sentido inflar el repo con eso.
 * Ningún vídeo del usuario sale de su navegador con esto: solo se descarga
 * el propio motor de FFmpeg (código, no datos del usuario). Si más adelante
 * se prefiere no depender de un CDN externo, se puede copiar estos archivos
 * a /public/ffmpeg y cambiar FFMPEG_CORE_BASE_URL por una ruta local.
 *
 * Se usa el núcleo single-thread (no @ffmpeg/core-mt): el multi-thread
 * necesita cabeceras COOP/COEP (SharedArrayBuffer) que complican el deploy
 * en Vercel/Netlify. Esto ya se decidió así desde el inicio del proyecto.
 */
const FFMPEG_CORE_VERSION = '0.12.10'
const FFMPEG_CORE_BASE_URL = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/esm`

/** Tiempo máximo por fragmento antes de abortar (FFmpeg.wasm puede colgarse en algunos casos conocidos). */
const EXEC_TIMEOUT_MS = 3 * 60 * 1000

export interface CutProgress {
  segmentIndex: number
  totalSegments: number
  /** Progreso (0-1) del fragmento actual, según lo reporta FFmpeg. */
  ratio: number
}

/**
 * Error de procesamiento con mensaje ya pensado para mostrarse al usuario.
 * Cualquier otro tipo de error (bug interno, etc.) se trata como inesperado
 * y no debe mostrar su mensaje técnico directamente (regla 8).
 */
export class VideoProcessingError extends Error {}

let ffmpegInstance: FFmpeg | null = null
let loadPromise: Promise<FFmpeg> | null = null

// El progreso se reporta por un único listener registrado una sola vez (ver
// getFFmpeg), redirigido dinámicamente a quien esté procesando en ese
// momento. Así se evita acumular listeners cada vez que se corta un
// fragmento o se llama a cutVideoSegments varias veces en la misma sesión.
let activeProgressHandler: ((progress: CutProgress) => void) | null = null
let currentSegmentIndex = 0
let currentTotalSegments = 0

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new VideoProcessingError(message)), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error: unknown) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

/**
 * Crea e inicializa FFmpeg una sola vez. Llamadas posteriores devuelven la
 * misma instancia ya cargada (nunca se reinicializa innecesariamente).
 */
async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance?.loaded) {
    return ffmpegInstance
  }

  if (loadPromise) {
    return loadPromise
  }

  loadPromise = (async () => {
    const ffmpeg = new FFmpeg()

    ffmpeg.on('progress', ({ progress }: { progress: number }) => {
      activeProgressHandler?.({
        segmentIndex: currentSegmentIndex,
        totalSegments: currentTotalSegments,
        ratio: clampRatio(progress),
      })
    })

    try {
      const coreURL = await toBlobURL(`${FFMPEG_CORE_BASE_URL}/ffmpeg-core.js`, 'text/javascript')
      const wasmURL = await toBlobURL(`${FFMPEG_CORE_BASE_URL}/ffmpeg-core.wasm`, 'application/wasm')
      await ffmpeg.load({ coreURL, wasmURL })
    } catch {
      throw new VideoProcessingError(
        'No se pudo cargar FFmpeg. Comprueba tu conexión a internet e inténtalo de nuevo.',
      )
    }

    ffmpegInstance = ffmpeg
    return ffmpeg
  })()

  try {
    return await loadPromise
  } catch (error) {
    loadPromise = null
    throw error
  }
}

/**
 * Corta varios fragmentos del mismo archivo de vídeo. El archivo de entrada
 * se escribe una sola vez en el sistema de archivos virtual de FFmpeg (no
 * una vez por fragmento), y se limpia al terminar, incluso si algo falla.
 */
export async function cutVideoSegments(
  file: File,
  segments: VideoSegment[],
  onProgress?: (progress: CutProgress) => void,
): Promise<ProcessedSegment[]> {
  if (segments.length === 0) {
    return []
  }

  const ffmpeg = await getFFmpeg()

  const inputExtension = getInputExtension(file.name)
  const inputFileName = `input${inputExtension}`

  currentTotalSegments = segments.length
  activeProgressHandler = onProgress ?? null

  const results: ProcessedSegment[] = []

  try {
    const inputData = await fetchFile(file)
    await ffmpeg.writeFile(inputFileName, inputData)

    for (let index = 0; index < segments.length; index += 1) {
      const segment = segments[index]
      if (!segment) {
        continue
      }

      currentSegmentIndex = index
      const outputFileName = `output-${index}.mp4`
      const duration = segment.endTime - segment.startTime

      try {
        await withTimeout(
          runCut(ffmpeg, inputFileName, segment.startTime, duration, outputFileName),
          EXEC_TIMEOUT_MS,
          `El corte del fragmento ${index + 1} tardó demasiado y se canceló.`,
        )

        const data = await ffmpeg.readFile(outputFileName)
        if (typeof data === 'string') {
          throw new VideoProcessingError(`FFmpeg no generó correctamente el fragmento ${index + 1}.`)
        }

        const blobUrl = URL.createObjectURL(new Blob([data], { type: 'video/mp4' }))

        results.push({
          id: segment.id,
          startTime: segment.startTime,
          endTime: segment.endTime,
          blobUrl,
          fileName: buildSegmentFileName(file.name, index),
        })
      } catch (error) {
        if (error instanceof VideoProcessingError) {
          throw error
        }
        throw new VideoProcessingError(`No se pudo cortar el fragmento ${index + 1}.`)
      } finally {
        await ffmpeg.deleteFile(outputFileName).catch(() => {})
      }
    }
  } finally {
    activeProgressHandler = null
    await ffmpeg.deleteFile(inputFileName).catch(() => {})
  }

  return results
}

/**
 * Ejecuta el corte de un único fragmento.
 *
 * Importante: -ss va ANTES de -i (búsqueda rápida en el archivo de entrada,
 * en vez de decodificar desde el principio) — mucho más rápido en vídeos
 * largos. La consecuencia es que la línea de tiempo de las opciones de
 * salida se reinicia a 0, así que se usa -t (duración relativa) y NO -to
 * (que sería relativo al punto de búsqueda, no al vídeo original: es un
 * error común y documentado de FFmpeg mezclar esto). Se re-codifica
 * (libx264/aac) en vez de copiar el stream para que el corte sea preciso al
 * fotograma exacto, no solo al keyframe más cercano.
 */
async function runCut(
  ffmpeg: FFmpeg,
  inputFileName: string,
  startTime: number,
  duration: number,
  outputFileName: string,
): Promise<void> {
  await ffmpeg.exec([
    '-ss',
    String(startTime),
    '-i',
    inputFileName,
    '-t',
    String(duration),
    '-c:v',
    'libx264',
    '-preset',
    'ultrafast',
    '-c:a',
    'aac',
    outputFileName,
  ])
}

function getInputExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.')
  return lastDot === -1 ? '.mp4' : fileName.slice(lastDot)
}

/** Libera las URLs de blob generadas por cutVideoSegments cuando ya no se necesiten. */
export function revokeProcessedSegments(processed: ProcessedSegment[]): void {
  for (const segment of processed) {
    URL.revokeObjectURL(segment.blobUrl)
  }
}
