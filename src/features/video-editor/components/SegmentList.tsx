import { formatDuration } from '../utils/formatDuration'
import type { VideoSegment } from '../types'
import styles from './SegmentList.module.css'

interface SegmentListProps {
  segments: VideoSegment[]
  /** Si se pasa, cada fila muestra un botón para quitar ese fragmento (modo manual). */
  onRemoveSegment?: (id: string) => void
}

export function SegmentList({ segments, onRemoveSegment }: SegmentListProps) {
  if (segments.length === 0) {
    return null
  }

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.heading}>Fragmentos ({segments.length})</h3>
      <ul className={styles.list}>
        {segments.map((segment, index) => (
          <li key={segment.id} className={styles.item}>
            <span className={styles.index}>{index + 1}</span>
            <span className={styles.range}>
              {formatDuration(segment.startTime)}–{formatDuration(segment.endTime)}
            </span>
            <span className={styles.length}>{formatDuration(segment.endTime - segment.startTime)}</span>
            {onRemoveSegment && (
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => onRemoveSegment(segment.id)}
                aria-label={`Quitar fragmento ${index + 1}`}
              >
                ✕
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
