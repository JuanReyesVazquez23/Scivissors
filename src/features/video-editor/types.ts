/**
 * Estados globales del editor, según la sección 9 de las reglas del proyecto.
 * Este incremento solo utiliza 'idle' | 'loading' | 'ready' | 'error'.
 * 'processing' y 'success' se usarán cuando integremos FFmpeg.wasm.
 */
export type EditorStatus = 'idle' | 'loading' | 'ready' | 'processing' | 'success' | 'error'
