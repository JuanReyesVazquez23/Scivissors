import { useCallback } from 'react'
import type { SyntheticEvent } from 'react'
import { formatBytes } from '../utils/formatBytes'
import { formatDuration } from '../utils/formatDuration'
import styles from './VideoPreview.module.css'

interface VideoPreviewProps {
  videoUrl: string
  fileName: string
  fileSizeBytes: number
  duration: number | null
  onMetadataLoaded: (duration: number) => void
  onPlaybackError: () => void
  onRemove: () => void
}

export function VideoPreview({
  videoUrl,
  fileName,
  fileSizeBytes,
  duration,
  onMetadataLoaded,
  onPlaybackError,
  onRemove,
}: VideoPreviewProps) {
  const handleLoadedMetadata = useCallback(
    (event: SyntheticEvent<HTMLVideoElement>) => {
      onMetadataLoaded(event.currentTarget.duration)
    },
    [onMetadataLoaded],
  )

  return (
    <div className={styles.wrapper}>
      <video
        className={styles.video}
        src={videoUrl}
        controls
        onLoadedMetadata={handleLoadedMetadata}
        onError={onPlaybackError}
      >
        Tu navegador no puede reproducir este vídeo.
      </video>

      <div className={styles.meta}>
        <div className={styles.metaText}>
          <p className={styles.fileName} title={fileName}>
            {fileName}
          </p>
          <p className={styles.fileInfo}>
            {formatBytes(fileSizeBytes)}
            {duration !== null ? ` · ${formatDuration(duration)}` : null}
          </p>
        </div>

        <button type="button" className={styles.removeButton} onClick={onRemove}>
          Elegir otro vídeo
        </button>
      </div>
    </div>
  )
}
