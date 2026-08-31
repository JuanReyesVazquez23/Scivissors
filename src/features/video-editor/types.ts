/**
 * Estados globales del editor, según la sección 9 de las reglas del proyecto.
 * Este incremento solo utiliza 'idle' | 'loading' | 'ready' | 'error'.
 * 'processing' y 'success' se usarán cuando integremos FFmpeg.wasm.
 */
export type EditorStatus = 'idle' | 'loading' | 'ready' | 'processing' | 'success' | 'error'

/**
 * Modo de corte elegido por el usuario. Ambos modos producirán, más adelante,
 * la misma estructura de datos interna (una lista de segmentos con inicio y
 * fin); solo cambia cómo se generan esos segmentos.
 */
export type CutMode = 'automatic' | 'manual'

/**
 * Un fragmento a cortar del vídeo original. Es la estructura compartida por
 * el modo automático y el manual: lo único que cambia entre ambos es cómo
 * se genera esta lista, no cómo se procesa después.
 */
export interface VideoSegment {
  id: string
  /** Segundos desde el inicio del vídeo. */
  startTime: number
  /** Segundos desde el inicio del vídeo. Siempre > startTime. */
  endTime: number
}

/** Estado del procesamiento real con FFmpeg.wasm (independiente del estado del archivo). */
export type ProcessingStatus = 'idle' | 'loading-ffmpeg' | 'processing' | 'success' | 'error'

/** Un VideoSegment ya cortado, listo para descargar. */
export interface ProcessedSegment {
  id: string
  startTime: number
  endTime: number
  /** Object URL del blob resultante; hay que revocarlo cuando ya no se use. */
  blobUrl: string
  fileName: string
}


