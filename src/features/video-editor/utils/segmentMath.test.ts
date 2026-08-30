import { describe, expect, it } from 'vitest'
import { calculateAutoSegmentPreview, generateAutoSegments } from './segmentMath'

describe('generateAutoSegments', () => {
  it('genera los segmentos reales para el ejemplo de referencia del proyecto: 4:36', () => {
    expect(generateAutoSegments(276)).toEqual([
      { id: 'segment-1', startTime: 0, endTime: 60 },
      { id: 'segment-2', startTime: 60, endTime: 120 },
      { id: 'segment-3', startTime: 120, endTime: 180 },
      { id: 'segment-4', startTime: 180, endTime: 240 },
      { id: 'segment-5', startTime: 240, endTime: 276 },
    ])
  })

  it('no añade un segmento sobrante cuando la duración es un múltiplo exacto', () => {
    const segments = generateAutoSegments(180)
    expect(segments).toHaveLength(3)
    expect(segments[2]).toEqual({ id: 'segment-3', startTime: 120, endTime: 180 })
  })

  it('genera un único segmento si el vídeo dura menos que un segmento completo', () => {
    expect(generateAutoSegments(45)).toEqual([{ id: 'segment-1', startTime: 0, endTime: 45 }])
  })

  it('los segmentos son contiguos y cubren toda la duración, sin huecos ni solapes', () => {
    const segments = generateAutoSegments(276)

    expect(segments[0]?.startTime).toBe(0)
    for (let i = 1; i < segments.length; i += 1) {
      expect(segments[i]?.startTime).toBe(segments[i - 1]?.endTime)
    }
    expect(segments[segments.length - 1]?.endTime).toBe(276)
  })

  it('acepta un tamaño de segmento distinto al de 60s por defecto', () => {
    expect(generateAutoSegments(100, 30)).toEqual([
      { id: 'segment-1', startTime: 0, endTime: 30 },
      { id: 'segment-2', startTime: 30, endTime: 60 },
      { id: 'segment-3', startTime: 60, endTime: 90 },
      { id: 'segment-4', startTime: 90, endTime: 100 },
    ])
  })

  it('devuelve una lista vacía para duraciones inválidas', () => {
    expect(generateAutoSegments(0)).toEqual([])
    expect(generateAutoSegments(-10)).toEqual([])
    expect(generateAutoSegments(Number.NaN)).toEqual([])
  })
})

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
