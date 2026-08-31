import { describe, expect, it } from 'vitest'
import { buildSegmentFileName } from './outputFileName'

describe('buildSegmentFileName', () => {
  it('inserta el sufijo antes de la extensión', () => {
    expect(buildSegmentFileName('vacaciones.mp4', 0)).toBe('vacaciones-fragmento-1.mp4')
    expect(buildSegmentFileName('vacaciones.mp4', 4)).toBe('vacaciones-fragmento-5.mp4')
  })

  it('funciona con nombres sin extensión', () => {
    expect(buildSegmentFileName('vacaciones', 0)).toBe('vacaciones-fragmento-1.mp4')
  })

  it('conserva el nombre base si tiene varios puntos', () => {
    expect(buildSegmentFileName('clip.final.v2.mov', 1)).toBe('clip.final.v2-fragmento-2.mp4')
  })
})
