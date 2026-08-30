export interface AutoSegmentPreview {
  fullSegments: number
  remainderSeconds: number
  totalSegments: number
}

const DEFAULT_SEGMENT_LENGTH_SECONDS = 60

/**
 * Calcula cuántos fragmentos de `segmentLengthSeconds` (60s por defecto)
 * saldrían de un vídeo de `durationSeconds`, más el fragmento sobrante si
 * la duración no es un múltiplo exacto. Solo para mostrar una vista previa
 * al usuario; la generación real de los segmentos (con sus tiempos exactos)
 * se hace más adelante, cuando se confirme el modo automático.
 */
export function calculateAutoSegmentPreview(
  durationSeconds: number,
  segmentLengthSeconds: number = DEFAULT_SEGMENT_LENGTH_SECONDS,
): AutoSegmentPreview {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0 || segmentLengthSeconds <= 0) {
    return { fullSegments: 0, remainderSeconds: 0, totalSegments: 0 }
  }

  const fullSegments = Math.floor(durationSeconds / segmentLengthSeconds)
  const rawRemainder = durationSeconds % segmentLengthSeconds
  const remainder = Math.round(rawRemainder * 100) / 100
  // Margen para imprecisión de punto flotante (ej. 180.00000000001).
  const hasRemainder = remainder > 0.001

  return {
    fullSegments,
    remainderSeconds: hasRemainder ? remainder : 0,
    totalSegments: fullSegments + (hasRemainder ? 1 : 0),
  }
}
