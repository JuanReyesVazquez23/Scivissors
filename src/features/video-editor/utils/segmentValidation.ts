import { formatDuration } from './formatDuration'

export type SegmentValidationErrorCode = 'INVALID_START' | 'INVALID_END' | 'START_AFTER_END' | 'END_EXCEEDS_DURATION'

export interface SegmentValidationError {
  code: SegmentValidationErrorCode
  message: string
}

export type SegmentValidationResult =
  | { valid: true; startTime: number; endTime: number }
  | { valid: false; error: SegmentValidationError }

/**
 * Valida un fragmento definido manualmente por el usuario. La entrada del
 * usuario nunca es de confianza (puede venir de un parseo fallido, por eso
 * acepta null): nunca se permiten valores negativos o no numéricos, start
 * siempre debe ser menor que end, y end nunca puede superar la duración
 * real del vídeo. Si durationSeconds es null, se omite la comprobación de
 * límite de duración para permitir añadir segmentos mientras se carga la
 * metadata del vídeo.
 */
export function validateManualSegment(
  startTime: number | null,
  endTime: number | null,
  durationSeconds: number | null,
): SegmentValidationResult {
  if (startTime === null || !Number.isFinite(startTime) || startTime < 0) {
    return { valid: false, error: { code: 'INVALID_START', message: 'El inicio no es un tiempo válido.' } }
  }

  if (endTime === null || !Number.isFinite(endTime) || endTime < 0) {
    return { valid: false, error: { code: 'INVALID_END', message: 'El fin no es un tiempo válido.' } }
  }

  if (startTime >= endTime) {
    return { valid: false, error: { code: 'START_AFTER_END', message: 'El inicio debe ser menor que el fin.' } }
  }

  if (durationSeconds !== null && endTime > durationSeconds) {
    return {
      valid: false,
      error: {
        code: 'END_EXCEEDS_DURATION',
        message: `El fin no puede superar la duración del vídeo (${formatDuration(durationSeconds)}).`,
      },
    }
  }

  return { valid: true, startTime, endTime }
}
