const UNITS = ['B', 'KB', 'MB', 'GB'] as const

/**
 * Convierte un número de bytes en un texto legible (ej. "5 MB", "1.5 GB").
 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B'
  }

  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1)
  const value = bytes / 1024 ** exponent

  // Sin decimales para bytes; un decimal (sin ceros de sobra) para el resto.
  const rounded = exponent === 0 ? Math.round(value) : Math.round(value * 10) / 10

  return `${rounded} ${UNITS[exponent]}`
}
