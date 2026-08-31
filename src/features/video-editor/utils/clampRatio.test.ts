import { describe, expect, it } from 'vitest'
import { clampRatio } from './clampRatio'

describe('clampRatio', () => {
  it('deja pasar valores dentro del rango', () => {
    expect(clampRatio(0.5)).toBe(0.5)
    expect(clampRatio(0)).toBe(0)
    expect(clampRatio(1)).toBe(1)
  })

  it('recorta valores fuera del rango', () => {
    expect(clampRatio(-1)).toBe(0)
    expect(clampRatio(2)).toBe(1)
  })

  it('trata NaN o Infinity como el mínimo', () => {
    expect(clampRatio(Number.NaN)).toBe(0)
    expect(clampRatio(Number.POSITIVE_INFINITY)).toBe(0)
    expect(clampRatio(Number.NEGATIVE_INFINITY)).toBe(0)
  })

  it('acepta un rango personalizado', () => {
    expect(clampRatio(150, 0, 100)).toBe(100)
  })
})
