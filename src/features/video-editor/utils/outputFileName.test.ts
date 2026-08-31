import { describe, expect, it } from 'vitest'
import { buildSegmentFileName } from './outputFileName'

describe('buildSegmentFileName', () => {
  it('inserta el sufijo antes de la extensión indicada', () => {
    expect(buildSegmentFileName('vacaciones.mp4', 0, '.mp4')).toBe('vacaciones-fragmento-1.mp4')
    expect(buildSegmentFileName('vacaciones.mp4', 4, '.mp4')).toBe('vacaciones-fragmento-5.mp4')
  })

  it('funciona con nombres sin extensión', () => {
    expect(buildSegmentFileName('vacaciones', 0, '.mp4')).toBe('vacaciones-fragmento-1.mp4')
  })

  it('conserva el nombre base si tiene varios puntos', () => {
    expect(buildSegmentFileName('clip.final.v2.mov', 1, '.mov')).toBe('clip.final.v2-fragmento-2.mov')
  })

  it('usa la extensión del formato de origen, no siempre .mp4', () => {
    expect(buildSegmentFileName('clip.webm', 0, '.webm')).toBe('clip-fragmento-1.webm')
  })
})

