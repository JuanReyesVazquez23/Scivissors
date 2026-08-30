import { describe, expect, it } from 'vitest'
import { calculateAutoSegmentPreview } from './segmentMath'

describe('calculateAutoSegmentPreview', () => {
  it('calcula el ejemplo de referencia del proyecto: 4:36 -> 4 de 1:00 + 1 de 0:36', () => {
    expect(calculateAutoSegmentPreview(276)).toEqual({
      fullSegments: 4,
      remainderSeconds: 36,
      totalSegments: 5,
    })
  })

  it('no genera fragmento sobrante cuando la duración es un múltiplo exacto', () => {
    expect(calculateAutoSegmentPreview(180)).toEqual({
      fullSegments: 3,
      remainderSeconds: 0,
      totalSegments: 3,
    })
  })

  it('trata un vídeo más corto que un segmento como un único fragmento', () => {
    expect(calculateAutoSegmentPreview(45)).toEqual({
      fullSegments: 0,
      remainderSeconds: 45,
      totalSegments: 1,
    })
  })

  it('ignora restos ínfimos por imprecisión de punto flotante', () => {
    expect(calculateAutoSegmentPreview(180.000_000_000_01)).toEqual({
      fullSegments: 3,
      remainderSeconds: 0,
      totalSegments: 3,
    })
  })

  it('acepta un tamaño de segmento distinto al de 60s por defecto', () => {
    expect(calculateAutoSegmentPreview(100, 30)).toEqual({
      fullSegments: 3,
      remainderSeconds: 10,
      totalSegments: 4,
    })
  })

  it('trata duraciones inválidas como cero fragmentos', () => {
    expect(calculateAutoSegmentPreview(0)).toEqual({ fullSegments: 0, remainderSeconds: 0, totalSegments: 0 })
    expect(calculateAutoSegmentPreview(-10)).toEqual({ fullSegments: 0, remainderSeconds: 0, totalSegments: 0 })
    expect(calculateAutoSegmentPreview(Number.NaN)).toEqual({ fullSegments: 0, remainderSeconds: 0, totalSegments: 0 })
  })
})
