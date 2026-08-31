/**
 * Genera el nombre de archivo para un fragmento exportado (0-based el
 * índice de entrada, 1-based en el nombre resultante para que sea legible).
 */
export function buildSegmentFileName(originalFileName: string, index: number): string {
  const lastDot = originalFileName.lastIndexOf('.')
  const base = lastDot === -1 ? originalFileName : originalFileName.slice(0, lastDot)
  return `${base}-fragmento-${index + 1}.mp4`
}
