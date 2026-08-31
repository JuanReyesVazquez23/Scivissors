import { useCallback, useMemo, useRef, useState } from 'react'
import { CutModeSelector } from './features/video-editor/components/CutModeSelector'
import { ManualSegmentEditor } from './features/video-editor/components/ManualSegmentEditor'
import { ProcessingPanel } from './features/video-editor/components/ProcessingPanel'
import { SegmentList } from './features/video-editor/components/SegmentList'
import { VideoDropzone } from './features/video-editor/components/VideoDropzone'
import { VideoPreview } from './features/video-editor/components/VideoPreview'
import { useManualSegments } from './features/video-editor/hooks/useManualSegments'
import { useVideoFile } from './features/video-editor/hooks/useVideoFile'
import type { CutMode, VideoSegment } from './features/video-editor/types'
import { generateAutoSegments } from './features/video-editor/utils/segmentMath'
import styles from './App.module.css'

function App() {
  const { status, file, videoUrl, duration, errorMessage, selectFile, handleMetadataLoaded, handlePlaybackError, reset } =
    useVideoFile()

  // El modo de corte vive fuera del hook de archivo porque pertenece al
  // "qué hacer con este vídeo", no al ciclo de vida del archivo en sí. Se
  // reinicia explícitamente cada vez que cambia el vídeo (ver handlers abajo)
  // para no arrastrar una selección de un vídeo anterior.
  const [cutMode, setCutMode] = useState<CutMode | null>(null)

  // Referencia al elemento <video> real (vía forwardRef en VideoPreview),
  // solo para leer en qué segundo va la reproducción cuando el usuario
  // toque "usar tiempo actual" en el editor manual.
  const videoRef = useRef<HTMLVideoElement>(null)
  const getCurrentPlaybackTime = useCallback(() => videoRef.current?.currentTime ?? 0, [])

  const manualSegments = useManualSegments(duration ?? 0)

  const handleFileSelected = useCallback(
    (selectedFile: File) => {
      setCutMode(null)
      manualSegments.reset()
      void selectFile(selectedFile)
    },
    [selectFile, manualSegments.reset],
  )

  const handleRemove = useCallback(() => {
    setCutMode(null)
    manualSegments.reset()
    reset()
  }, [reset, manualSegments.reset])

  // Los segmentos automáticos se derivan de duration + cutMode: no se
  // guardan como estado propio porque siempre se pueden recalcular a partir
  // de datos que ya existen (regla 10: no duplicar en estado lo derivable).
  const autoSegments: VideoSegment[] = useMemo(() => {
    if (cutMode !== 'automatic' || duration === null) {
      return []
    }
    return generateAutoSegments(duration)
  }, [cutMode, duration])

  // La lista "activa" es la que realmente se va a cortar, sin importar qué
  // modo la generó — esto es justo lo que permite que el mismo panel de
  // procesamiento sirva para ambos modos sin duplicar lógica.
  const activeSegments: VideoSegment[] =
    cutMode === 'automatic' ? autoSegments : cutMode === 'manual' ? manualSegments.segments : []

  return (
    <div className={styles.appShell}>
      <header className={styles.header}>
        <h1 className={styles.logo}>scivissors</h1>
        <p className={styles.tagline}>Corta fragmentos de vídeo directamente en tu navegador.</p>

        <div className={styles.cutLine} aria-hidden="true">
          <ScissorsIcon />
          <span className={styles.dashes} />
        </div>
      </header>

      <main className={styles.main}>
        {status === 'ready' && file && videoUrl ? (
          <div className={styles.readyState}>
            <VideoPreview
              ref={videoRef}
              videoUrl={videoUrl}
              fileName={file.name}
              fileSizeBytes={file.size}
              duration={duration}
              onMetadataLoaded={handleMetadataLoaded}
              onPlaybackError={handlePlaybackError}
              onRemove={handleRemove}
            />

            {duration !== null ? (
              <>
                <CutModeSelector durationSeconds={duration} selectedMode={cutMode} onSelectMode={setCutMode} />

                {cutMode === 'automatic' && <SegmentList segments={autoSegments} />}

                {cutMode === 'manual' && (
                  <>
                    <ManualSegmentEditor
                      durationSeconds={duration}
                      onAddSegment={manualSegments.addSegment}
                      getCurrentPlaybackTime={getCurrentPlaybackTime}
                    />
                    <SegmentList segments={manualSegments.segments} onRemoveSegment={manualSegments.removeSegment} />
                  </>
                )}

                {activeSegments.length > 0 && <ProcessingPanel file={file} segments={activeSegments} />}
              </>
            ) : (
              <p className={styles.loadingHint}>Cargando duración del vídeo…</p>
            )}
          </div>
        ) : (
          <VideoDropzone onFileSelected={handleFileSelected} errorMessage={errorMessage} isLoading={status === 'loading'} />
        )}
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerText}>
          Todo el procesamiento ocurre en tu dispositivo. Ningún vídeo se sube a un servidor.
        </p>
      </footer>
    </div>
  )
}

function ScissorsIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      role="img"
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  )
}

export default App
