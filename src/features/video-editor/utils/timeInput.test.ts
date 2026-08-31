import { describe, expect, it } from 'vitest'
import { parseTimeInput } from './timeInput'

describe('parseTimeInput', () => {
  it('parsea segundos puros', () => {
    expect(parseTimeInput('90')).toBe(90)
    expect(parseTimeInput('5')).toBe(5)
    expect(parseTimeInput('0')).toBe(0)
  })

  it('parsea mm:ss', () => {
    expect(parseTimeInput('1:30')).toBe(90)
    expect(parseTimeInput('04:36')).toBe(276) // el ejemplo de referencia del proyecto
  })

  it('parsea hh:mm:ss', () => {
    expect(parseTimeInput('1:01:01')).toBe(3661)
  })

  it('ignora espacios al inicio/final', () => {
    expect(parseTimeInput('  90  ')).toBe(90)
  })

  it('devuelve null para texto vacío, inválido o mal formado', () => {
    expect(parseTimeInput('')).toBeNull()
    expect(parseTimeInput('   ')).toBeNull()
    expect(parseTimeInput('abc')).toBeNull()
    expect(parseTimeInput('-5')).toBeNull()
    expect(parseTimeInput('1:2:3:4')).toBeNull()
    expect(parseTimeInput('1:')).toBeNull()
  })
})
