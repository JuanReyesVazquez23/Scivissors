import { useState } from 'react'
import { formatDuration } from '../utils/formatDuration'
import { parseTimeInput } from '../utils/timeInput'
import type { SegmentValidationResult } from '../utils/segmentValidation'
import styles from './ManualSegmentEditor.module.css'

interface ManualSegmentEditorProps {
  durationSeconds: number
  onAddSegment: (startTime: number | null, endTime: number | null) => SegmentValidationResult
  getCurrentPlaybackTime: () => number
}

export function ManualSegmentEditor({ durationSeconds, onAddSegment, getCurrentPlaybackTime }: ManualSegmentEditorProps) {
  const [startInput, setStartInput] = useState('')
  const [endInput, setEndInput] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const useCurrentTimeFor = (field: 'start' | 'end') => {
    const currentTime = formatDuration(getCurrentPlaybackTime())
    if (field === 'start') {
      setStartInput(currentTime)
    } else {
      setEndInput(currentTime)
    }
  }

  const handleAdd = () => {
    const result = onAddSegment(parseTimeInput(startInput), parseTimeInput(endInput))

    if (!result.valid) {
      setFormError(result.error.message)
      return
    }

    setFormError(null)
    setStartInput('')
    setEndInput('')
  }

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.heading}>Añadir fragmento</h3>

      <div className={styles.fields}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Inicio</span>
          <div className={styles.fieldRow}>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0:00"
              value={startInput}
              onChange={(event) => setStartInput(event.target.value)}
              className={styles.input}
              aria-label="Tiempo de inicio del fragmento"
            />
            <button type="button" className={styles.useCurrentButton} onClick={() => useCurrentTimeFor('start')}>
              Usar actual
            </button>
          </div>
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Fin</span>
          <div className={styles.fieldRow}>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0:00"
              value={endInput}
              onChange={(event) => setEndInput(event.target.value)}
              className={styles.input}
              aria-label="Tiempo de fin del fragmento"
            />
            <button type="button" className={styles.useCurrentButton} onClick={() => useCurrentTimeFor('end')}>
              Usar actual
            </button>
          </div>
        </label>
      </div>

      {formError && (
        <p className={styles.error} role="alert">
          {formError}
        </p>
      )}

      <button type="button" className={styles.addButton} onClick={handleAdd}>
        Añadir fragmento
      </button>

      <p className={styles.hint}>
        Escribe los segundos (ej. 90) o minutos:segundos (ej. 1:30). Duración del vídeo: {formatDuration(durationSeconds)}.
      </p>
    </div>
  )
}
