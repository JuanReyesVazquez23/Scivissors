import { VideoDropzone } from './features/video-editor/components/VideoDropzone'
import { VideoPreview } from './features/video-editor/components/VideoPreview'
import { useVideoFile } from './features/video-editor/hooks/useVideoFile'
import styles from './App.module.css'

function App() {
  const { status, file, videoUrl, duration, errorMessage, selectFile, handleMetadataLoaded, handlePlaybackError, reset } =
    useVideoFile()

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
          <VideoPreview
            videoUrl={videoUrl}
            fileName={file.name}
            fileSizeBytes={file.size}
            duration={duration}
            onMetadataLoaded={handleMetadataLoaded}
            onPlaybackError={handlePlaybackError}
            onRemove={reset}
          />
        ) : (
          <VideoDropzone onFileSelected={selectFile} errorMessage={errorMessage} isLoading={status === 'loading'} />
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
