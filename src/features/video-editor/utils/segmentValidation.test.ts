import { describe, expect, it } from 'vitest'
import { validateManualSegment } from './segmentValidation'

const DURATION = 276 // 4:36, el vídeo de referencia del proyecto

describe('validateManualSegment', () => {
  it('acepta un fragmento válido dentro de la duración', () => {
    expect(validateManualSegment(10, 20, DURATION)).toEqual({ valid: true, startTime: 10, endTime: 20 })
  })

  it('rechaza un inicio negativo o inválido', () => {
    expect(validateManualSegment(-1, 20, DURATION)).toMatchObject({ valid: false, error: { code: 'INVALID_START' } })
    expect(validateManualSegment(null, 20, DURATION)).toMatchObject({ valid: false, error: { code: 'INVALID_START' } })
    expect(validateManualSegment(Number.NaN, 20, DURATION)).toMatchObject({
      valid: false,
      error: { code: 'INVALID_START' },
    })
  })

  it('rechaza un fin negativo o inválido', () => {
    expect(validateManualSegment(10, -1, DURATION)).toMatchObject({ valid: false, error: { code: 'INVALID_END' } })
    expect(validateManualSegment(10, null, DURATION)).toMatchObject({ valid: false, error: { code: 'INVALID_END' } })
  })

  it('rechaza cuando el inicio no es menor que el fin', () => {
    expect(validateManualSegment(20, 20, DURATION)).toMatchObject({ valid: false, error: { code: 'START_AFTER_END' } })
    expect(validateManualSegment(30, 20, DURATION)).toMatchObject({ valid: false, error: { code: 'START_AFTER_END' } })
  })

  it('rechaza cuando el fin supera la duración del vídeo', () => {
    expect(validateManualSegment(10, DURATION + 1, DURATION)).toMatchObject({
      valid: false,
      error: { code: 'END_EXCEEDS_DURATION' },
    })
  })

  it('acepta un fragmento que llega exactamente hasta el final del vídeo', () => {
    expect(validateManualSegment(200, DURATION, DURATION)).toEqual({ valid: true, startTime: 200, endTime: DURATION })
  })
})
