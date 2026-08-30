import { describe, expect, it } from 'vitest'
import { formatBytes } from './formatBytes'

describe('formatBytes', () => {
  it('formatea bytes sin decimales', () => {
    expect(formatBytes(500)).toBe('500 B')
  })

  it('formatea kilobytes exactos sin decimales de sobra', () => {
    expect(formatBytes(2048)).toBe('2 KB')
  })

  it('formatea megabytes exactos', () => {
    expect(formatBytes(5 * 1024 * 1024)).toBe('5 MB')
  })

  it('formatea gigabytes con un decimal cuando no es un número exacto', () => {
    expect(formatBytes(1.5 * 1024 * 1024 * 1024)).toBe('1.5 GB')
  })

  it('trata tamaños de 0 o negativos como "0 B"', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(-10)).toBe('0 B')
  })
})
