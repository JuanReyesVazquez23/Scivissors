import { formatDuration } from '../utils/formatDuration'
import { calculateAutoSegmentPreview } from '../utils/segmentMath'
import type { AutoSegmentPreview } from '../utils/segmentMath'
import type { CutMode } from '../types'
import styles from './CutModeSelector.module.css'

interface CutModeSelectorProps {
  durationSeconds: number
  selectedMode: CutMode | null
  onSelectMode: (mode: CutMode) => void
}

export function CutModeSelector({ durationSeconds, selectedMode, onSelectMode }: CutModeSelectorProps) {
  const preview = calculateAutoSegmentPreview(durationSeconds)

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>¿Cómo quieres cortar el vídeo?</h2>

      <div className={styles.options} role="group" aria-label="Modo de corte">
        <button
          type="button"
          className={optionClassName(selectedMode === 'automatic')}
          aria-pressed={selectedMode === 'automatic'}
          onClick={() => onSelectMode('automatic')}
        >
          <span className={styles.optionTitle}>Automático</span>
          <span className={styles.optionDescription}>{describeAutoPreview(preview)}</span>
        </button>

        <button
          type="button"
          className={optionClassName(selectedMode === 'manual')}
          aria-pressed={selectedMode === 'manual'}
          onClick={() => onSelectMode('manual')}
        >
          <span className={styles.optionTitle}>Manual</span>
          <span className={styles.optionDescription}>Tú eliges dónde cortar, tantas veces como quieras.</span>
        </button>
      </div>
    </div>
  )
}

function optionClassName(isSelected: boolean): string {
  return isSelected ? `${styles.option} ${styles.optionSelected}` : styles.option
}

function describeAutoPreview(preview: AutoSegmentPreview): string {
  const { fullSegments, remainderSeconds, totalSegments } = preview

  if (totalSegments === 0) {
    return 'Corta el vídeo en fragmentos de 1 minuto.'
  }

  if (remainderSeconds === 0) {
    const segmentWord = totalSegments === 1 ? 'fragmento' : 'fragmentos'
    const verb = totalSegments === 1 ? 'generará' : 'generarán'
    return `Se ${verb} ${totalSegments} ${segmentWord} de 1:00 cada uno.`
  }

  if (fullSegments === 0) {
    return `Se generará 1 fragmento de ${formatDuration(remainderSeconds)}.`
  }

  return `Se generarán ${totalSegments} fragmentos: ${fullSegments} de 1:00 y uno de ${formatDuration(remainderSeconds)}.`
}
