import { useCallback, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, KeyboardEvent } from 'react'
import { SUPPORTED_VIDEO_EXTENSIONS } from '../services/videoValidation'
import styles from './VideoDropzone.module.css'

interface VideoDropzoneProps {
  onFileSelected: (file: File) => void
  errorMessage: string | null
  isLoading: boolean
}

const ACCEPT_ATTRIBUTE = SUPPORTED_VIDEO_EXTENSIONS.map((extension) => `.${extension}`).join(',')
const FORMATS_LABEL = SUPPORTED_VIDEO_EXTENSIONS.map((extension) => extension.toUpperCase()).join(', ')

export function VideoDropzone({ onFileSelected, errorMessage, isLoading }: VideoDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragActive, setIsDragActive] = useState(false)

  const openFileDialog = useCallback(() => {
    if (isLoading) return
    inputRef.current?.click()
  }, [isLoading])

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file && !isLoading) {
        onFileSelected(file)
      }
      // Se limpia el valor para poder volver a seleccionar el mismo archivo
      // tras un error, ya que <input type="file"> no dispara "change" si el
      // usuario elige el mismo archivo dos veces seguidas.
      event.target.value = ''
    },
    [isLoading, onFileSelected],
  )

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsDragActive(false)
      if (isLoading) return
      const file = event.dataTransfer.files?.[0]
      if (file) {
        onFileSelected(file)
      }
    },
    [isLoading, onFileSelected],
  )

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      if (!isLoading) {
        setIsDragActive(true)
      }
    },
    [isLoading],
  )

  const handleDragLeave = useCallback(() => {
    setIsDragActive(false)
  }, [])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        openFileDialog()
      }
    },
    [openFileDialog],
  )

  const dropzoneClassName = [
    styles.dropzone,
    isDragActive ? styles.dropzoneActive : '',
    isLoading ? styles.dropzoneDisabled : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.wrapper}>
      <div
        className={dropzoneClassName}
        onClick={openFileDialog}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={isLoading ? -1 : 0}
        aria-label="Seleccionar archivo de vídeo"
        aria-disabled={isLoading}
      >
        <p className={styles.timecode}>00:00 / 00:00</p>
        <p className={styles.instructions}>
          {isLoading ? 'Comprobando el archivo…' : 'Arrastra tu vídeo aquí o toca para seleccionarlo'}
        </p>
        <p className={styles.formats}>{FORMATS_LABEL}</p>
      </div>

      {errorMessage && (
        <p className={styles.error} role="alert">
          <WarningIcon />
          <span>{errorMessage}</span>
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        onChange={handleInputChange}
        className={styles.hiddenInput}
        tabIndex={-1}
        aria-hidden="true"
        disabled={isLoading}
      />
    </div>
  )
}

function WarningIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      role="img"
      aria-hidden="true"
    >
      <path d="M12 9v4" strokeLinecap="round" />
      <path d="M12 17h.01" strokeLinecap="round" />
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    </svg>
  )
}
