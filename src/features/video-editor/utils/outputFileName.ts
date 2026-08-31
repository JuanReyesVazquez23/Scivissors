/**
 * Genera el nombre de archivo para un fragmento exportado (0-based el
 * índice de entrada, 1-based en el nombre resultante para que sea legible).
 * La extensión debe coincidir con el contenedor real de salida (no siempre
 * .mp4: al copiar el stream sin recodificar, el archivo de salida usa el
 * mismo formato que el original).
 */
export function buildSegmentFileName(originalFileName: string, index: number, extension: string): string {
  const lastDot = originalFileName.lastIndexOf('.')
  const base = lastDot === -1 ? originalFileName : originalFileName.slice(0, lastDot)
  return `${base}-fragmento-${index + 1}${extension}`
}
