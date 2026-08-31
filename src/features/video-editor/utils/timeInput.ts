/**
 * Convierte un texto de tiempo escrito por el usuario a segundos totales.
 * Acepta: solo segundos ("90"), mm:ss ("1:30") o hh:mm:ss ("1:01:01").
 * Devuelve null si el formato no es reconocible (nunca lanza excepción:
 * la entrada del usuario nunca es de confianza).
 */
export function parseTimeInput(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed === '') {
    return null
  }

  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return Number.parseFloat(trimmed)
  }

  const parts = trimmed.split(':')
  if (parts.length < 2 || parts.length > 3) {
    return null
  }

  const numbers = parts.map((part) => Number.parseInt(part, 10))
  if (numbers.some((n) => Number.isNaN(n) || n < 0)) {
    return null
  }

  return numbers.reduce((totalSeconds, n) => totalSeconds * 60 + n, 0)
}
