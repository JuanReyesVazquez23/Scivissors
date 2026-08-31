import { formatDuration } from '../utils/formatDuration'
import { useVideoProcessor } from '../hooks/useVideoProcessor'
import type { VideoSegment } from '../types'
import styles from './ProcessingPanel.module.css'

interface ProcessingPanelProps {
  file: File
  segments: VideoSegment[]
}

export function ProcessingPanel({ file, segments }: ProcessingPanelProps) {
  const { status, progress, results, errorMessage, processSegments, reset } = useVideoProcessor()

  if (segments.length === 0) {
    return null
  }

  const segmentWord = segments.length === 1 ? 'fragmento' : 'fragmentos'
  const handleProcess = () => {
    void processSegments(file, segments)
  }

  return (
    <div className={styles.wrapper}>
      {status === 'idle' && (
        <>
          <button type="button" className={styles.processButton} onClick={handleProcess}>
            Cortar {segments.length} {segmentWord}
          </button>
          <p className={styles.hint}>
            El corte prioriza velocidad: el inicio real puede caer hasta un par de segundos antes del punto exacto
            pedido, según el vídeo.
          </p>
        </>
      )}

      {status === 'loading-ffmpeg' && (
        <p className={styles.status}>Cargando FFmpeg (puede tardar la primera vez)…</p>
      )}

      {status === 'processing' && (
        <div>
          <p className={styles.status}>Cortando… {Math.round(progress * 100)}%</p>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        </div>
      )}

      {status === 'error' && (
        <>
          <p className={styles.error} role="alert">
            {errorMessage}
          </p>
          <button type="button" className={styles.processButton} onClick={handleProcess}>
            Reintentar
          </button>
        </>
      )}

      {status === 'success' && (
        <div>
          <h3 className={styles.heading}>
            Listo — {results.length} {results.length === 1 ? 'fragmento' : 'fragmentos'}
          </h3>
          <ul className={styles.downloadList}>
            {results.map((result) => (
              <li key={result.id} className={styles.downloadItem}>
                <span className={styles.downloadRange}>
                  {formatDuration(result.startTime)}–{formatDuration(result.endTime)}
                </span>
                <a href={result.blobUrl} download={result.fileName} className={styles.downloadLink}>
                  Descargar
                </a>
              </li>
            ))}
          </ul>
          <button type="button" className={styles.resetButton} onClick={reset}>
            Volver a cortar
          </button>
        </div>
      )}
    </div>
  )
}
