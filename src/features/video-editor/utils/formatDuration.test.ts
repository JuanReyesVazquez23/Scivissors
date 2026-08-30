import { describe, expect, it } from 'vitest'
import { formatDuration } from './formatDuration'

describe('formatDuration', () => {
  it('formatea segundos y minutos como mm:ss', () => {
    expect(formatDuration(36)).toBe('00:36')
    expect(formatDuration(65)).toBe('01:05')
    expect(formatDuration(276)).toBe('04:36') // el ejemplo de 4:36 del proyecto
  })

  it('formatea duraciones de una hora o más como hh:mm:ss', () => {
    expect(formatDuration(3661)).toBe('01:01:01')
  })

  it('trata valores inválidos o negativos como "00:00"', () => {
    expect(formatDuration(-5)).toBe('00:00')
    expect(formatDuration(Number.NaN)).toBe('00:00')
  })
})
