import { formatBytes } from '../utils/formatBytes'

/**
 * Formatos aceptados. Se limita a contenedores que los navegadores modernos
 * pueden reproducir de forma nativa con <video>, ya que este incremento
 * necesita mostrar una previsualización real (no solo aceptar el archivo).
 */
export const SUPPORTED_VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm', 'ogv'] as const
export type SupportedVideoExtension = (typeof SUPPORTED_VIDEO_EXTENSIONS)[number]

/** Límite de tamaño para el MVP. Ajustable: los vídeos grandes pueden agotar
 * la memoria del navegador al procesarse con FFmpeg.wasm, especialmente en móvil. */
export const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024 // 500 MB

export type VideoValidationErrorCode =
  | 'EMPTY_FILE'
  | 'FILE_TOO_LARGE'
  | 'INVALID_EXTENSION'
  | 'INVALID_MIME'
  | 'INVALID_SIGNATURE'
  | 'READ_ERROR'

export interface VideoValidationError {
  code: VideoValidationErrorCode
  message: string
}

export type VideoValidationResult = { valid: true } | { valid: false; error: VideoValidationError }

function invalid(code: VideoValidationErrorCode, message: string): VideoValidationResult {
  return { valid: false, error: { code, message } }
}

function getFileExtension(fileName: string): string | null {
  const lastDot = fileName.lastIndexOf('.')
  if (lastDot === -1 || lastDot === fileName.length - 1) {
    return null
  }
  return fileName.slice(lastDot + 1).toLowerCase()
}

function isSupportedExtension(value: string | null): value is SupportedVideoExtension {
  return value !== null && (SUPPORTED_VIDEO_EXTENSIONS as readonly string[]).includes(value)
}

async function readSignatureBytes(file: File, length: number): Promise<Uint8Array> {
  const buffer = await file.slice(0, length).arrayBuffer()
  return new Uint8Array(buffer)
}

function bytesToAscii(bytes: Uint8Array, start: number, end: number): string {
  return String.fromCharCode(...bytes.slice(start, end))
}

// ISO-BMFF (MP4/MOV): el tipo de "box" ('ftyp') aparece en los bytes 4-8
// en prácticamente todos los archivos reales generados por cámaras, móviles
// o software de edición.
function matchesMp4Signature(bytes: Uint8Array): boolean {
  return bytesToAscii(bytes, 4, 8) === 'ftyp'
}

// WebM (Matroska/EBML): cabecera fija de 4 bytes.
function matchesWebmSignature(bytes: Uint8Array): boolean {
  return bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3
}

// Ogg: cabecera ASCII "OggS".
function matchesOggSignature(bytes: Uint8Array): boolean {
  return bytesToAscii(bytes, 0, 4) === 'OggS'
}

const SIGNATURE_VALIDATORS: Record<SupportedVideoExtension, (bytes: Uint8Array) => boolean> = {
  mp4: matchesMp4Signature,
  mov: matchesMp4Signature,
  webm: matchesWebmSignature,
  ogv: matchesOggSignature,
}

const UNSUPPORTED_FORMAT_MESSAGE = 'Formato no compatible. Usa un vídeo MP4, WebM, MOV u OGV.'

/**
 * Valida un archivo de vídeo antes de cargarlo en la app.
 *
 * Importante: no confía únicamente en la extensión ni en `file.type` (el
 * navegador suele derivar `file.type` de la propia extensión, así que por
 * sí solo no demuestra nada). La comprobación real es la firma binaria del
 * archivo, leyendo sus primeros bytes.
 */
export async function validateVideoFile(file: File): Promise<VideoValidationResult> {
  if (file.size === 0) {
    return invalid('EMPTY_FILE', 'El archivo está vacío.')
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return invalid(
      'FILE_TOO_LARGE',
      `El archivo supera el tamaño máximo permitido (${formatBytes(MAX_FILE_SIZE_BYTES)}).`,
    )
  }

  const extension = getFileExtension(file.name)
  if (!isSupportedExtension(extension)) {
    return invalid('INVALID_EXTENSION', UNSUPPORTED_FORMAT_MESSAGE)
  }

  if (file.type && !file.type.startsWith('video/')) {
    return invalid('INVALID_MIME', 'El archivo no parece ser un vídeo.')
  }

  let signatureBytes: Uint8Array
  try {
    signatureBytes = await readSignatureBytes(file, 12)
  } catch {
    return invalid('READ_ERROR', 'No se pudo leer el archivo. Inténtalo de nuevo.')
  }

  const matchesSignature = SIGNATURE_VALIDATORS[extension](signatureBytes)
  if (!matchesSignature) {
    return invalid(
      'INVALID_SIGNATURE',
      'El contenido del archivo no coincide con un vídeo válido de ese formato. Puede estar dañado o mal renombrado.',
    )
  }

  return { valid: true }
}
