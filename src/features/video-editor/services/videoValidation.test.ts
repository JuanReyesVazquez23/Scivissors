import { describe, expect, it } from 'vitest'
import { MAX_FILE_SIZE_BYTES, validateVideoFile } from './videoValidation'

function makeFile(bytes: number[], name: string, type = 'video/mp4'): File {
  return new File([new Uint8Array(bytes)], name, { type })
}

// Cabecera MP4 real y mínima: tamaño de box + "ftyp" + "isom"
const MP4_HEADER = [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]
const WEBM_HEADER = [0x1a, 0x45, 0xdf, 0xa3, 0x00, 0x00, 0x00, 0x00]
const OGG_HEADER = [0x4f, 0x67, 0x67, 0x53, 0x00, 0x00, 0x00, 0x00]
const NOT_A_VIDEO = Array.from('esto no es un vídeo real').map((char) => char.charCodeAt(0))

describe('validateVideoFile', () => {
  it('acepta un mp4 con firma binaria válida', async () => {
    const result = await validateVideoFile(makeFile(MP4_HEADER, 'clip.mp4'))
    expect(result.valid).toBe(true)
  })

  it('acepta un webm con firma binaria válida', async () => {
    const result = await validateVideoFile(makeFile(WEBM_HEADER, 'clip.webm', 'video/webm'))
    expect(result.valid).toBe(true)
  })

  it('acepta un ogv con firma binaria válida', async () => {
    const result = await validateVideoFile(makeFile(OGG_HEADER, 'clip.ogv', 'video/ogg'))
    expect(result.valid).toBe(true)
  })

  it('rechaza un archivo .mp4 que en realidad no es un vídeo (solo la extensión coincide)', async () => {
    const result = await validateVideoFile(makeFile(NOT_A_VIDEO, 'video.mp4'))
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.error.code).toBe('INVALID_SIGNATURE')
    }
  })

  it('rechaza extensiones no soportadas', async () => {
    const result = await validateVideoFile(makeFile(MP4_HEADER, 'clip.exe', 'application/octet-stream'))
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.error.code).toBe('INVALID_EXTENSION')
    }
  })

  it('rechaza archivos vacíos', async () => {
    const result = await validateVideoFile(makeFile([], 'clip.mp4'))
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.error.code).toBe('EMPTY_FILE')
    }
  })

  it('rechaza archivos que superan el tamaño máximo', async () => {
    const file = makeFile([1], 'clip.mp4')
    Object.defineProperty(file, 'size', { value: MAX_FILE_SIZE_BYTES + 1 })

    const result = await validateVideoFile(file)
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.error.code).toBe('FILE_TOO_LARGE')
    }
  })
})
