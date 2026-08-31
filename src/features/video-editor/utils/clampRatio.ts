/**
 * Limita un valor a un rango [min, max]. Trata NaN/Infinity como el mínimo
 * (nunca se debe mostrar una barra de progreso rota por un valor inválido).
 */
export function clampRatio(value: number, min = 0, max = 1): number {
  if (!Number.isFinite(value)) {
    return min
  }
  return Math.min(Math.max(value, min), max)
}
