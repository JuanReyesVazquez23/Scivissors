import type { VideoSegment } from '../types'

export interface AutoSegmentPreview {
  fullSegments: number
  remainderSeconds: number
  totalSegments: number
}

const DEFAULT_SEGMENT_LENGTH_SECONDS = 60

/**
 * Genera la lista real de segmentos para el modo automático: fragmentos de
 * `segmentLengthSeconds` (60s por defecto) desde el inicio del vídeo, más un
 * último fragmento con el resto si la duración no es un múltiplo exacto.
 * Esta es la fuente de verdad que usará el corte real más adelante.
 */
export function generateAutoSegments(
  durationSeconds: number,
  segmentLengthSeconds: number = DEFAULT_SEGMENT_LENGTH_SECONDS,
): VideoSegment[] {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0 || segmentLengthSeconds <= 0) {
    return []
  }

  const fullSegments = Math.floor(durationSeconds / segmentLengthSeconds)
  const segments: VideoSegment[] = []

  for (let index = 0; index < fullSegments; index += 1) {
    const startTime = index * segmentLengthSeconds
    segments.push({
      id: `segment-${index + 1}`,
      startTime,
      endTime: startTime + segmentLengthSeconds,
    })
  }

  const remainderStart = fullSegments * segmentLengthSeconds
  const remainderSeconds = durationSeconds - remainderStart

  // Margen para imprecisión de punto flotante (ej. 180.00000000001).
  if (remainderSeconds > 0.001) {
    segments.push({
      id: `segment-${fullSegments + 1}`,
      startTime: remainderStart,
      // Se usa la duración real (sin redondear) para que el último corte
      // llegue exactamente al final del vídeo, sin arrastrar redondeos.
      endTime: durationSeconds,
    })
  }

  return segments
}

/**
 * Vista previa (solo para mostrar al usuario cuántos fragmentos saldrían)
 * derivada de `generateAutoSegments`, para no duplicar el cálculo.
 */
export function calculateAutoSegmentPreview(
  durationSeconds: number,
  segmentLengthSeconds: number = DEFAULT_SEGMENT_LENGTH_SECONDS,
): AutoSegmentPreview {
  const segments = generateAutoSegments(durationSeconds, segmentLengthSeconds)

  if (segments.length === 0) {
    return { fullSegments: 0, remainderSeconds: 0, totalSegments: 0 }
  }

  const lastSegment = segments[segments.length - 1]
  if (!lastSegment) {
    // No debería ocurrir: ya se comprobó que segments.length > 0. Guarda
    // defensiva por noUncheckedIndexedAccess.
    return { fullSegments: 0, remainderSeconds: 0, totalSegments: 0 }
  }

  const lastDuration = lastSegment.endTime - lastSegment.startTime
  const isLastSegmentFull = Math.abs(lastDuration - segmentLengthSeconds) < 0.001
  const fullSegments = isLastSegmentFull ? segments.length : segments.length - 1
  const remainderSeconds = isLastSegmentFull ? 0 : Math.round(lastDuration * 100) / 100

  return { fullSegments, remainderSeconds, totalSegments: segments.length }
}
