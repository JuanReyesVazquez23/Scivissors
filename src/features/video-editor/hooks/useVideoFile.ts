import { useCallback, useEffect, useRef, useState } from 'react'
import { validateVideoFile } from '../services/videoValidation'
import type { EditorStatus } from '../types'

interface VideoFileState {
  status: EditorStatus
  file: File | null
  videoUrl: string | null
  duration: number | null
  errorMessage: string | null
}

const INITIAL_STATE: VideoFileState = {
  status: 'idle',
  file: null,
  videoUrl: null,
  duration: null,
  errorMessage: null,
}

/**
 * Gestiona la selección, validación, previsualización y limpieza de memoria
 * de un archivo de vídeo. FFmpeg no participa en este paso: la duración y la
 * reproducción se obtienen directamente del elemento <video> del navegador.
 */
export function useVideoFile() {
  const [state, setState] = useState<VideoFileState>(INITIAL_STATE)

  // Referencia (no estado) para poder revocar el Object URL anterior de forma
  // fiable, incluso dentro de callbacks async, sin depender de un re-render.
  const videoUrlRef = useRef<string | null>(null)

  const revokeCurrentUrl = useCallback(() => {
    if (videoUrlRef.current) {
      URL.revokeObjectURL(videoUrlRef.current)
      videoUrlRef.current = null
    }
  }, [])

  const selectFile = useCallback(
    async (file: File) => {
      setState({ status: 'loading', file: null, videoUrl: null, duration: null, errorMessage: null })

      const result = await validateVideoFile(file)

      if (!result.valid) {
        setState({
          status: 'error',
          file: null,
          videoUrl: null,
          duration: null,
          errorMessage: result.error.message,
        })
        return
      }

      revokeCurrentUrl()
      const url = URL.createObjectURL(file)
      videoUrlRef.current = url

      setState({ status: 'ready', file, videoUrl: url, duration: null, errorMessage: null })
    },
    [revokeCurrentUrl],
  )

  // El elemento <video> nos entrega la duración real una vez decodifica los
  // metadatos; la guardamos aquí para reutilizarla en incrementos futuros
  // (cálculo de segmentos automáticos).
  const handleMetadataLoaded = useCallback((duration: number) => {
    setState((prev) => (prev.status === 'ready' ? { ...prev, duration } : prev))
  }, [])

  // Defensa adicional: un archivo puede pasar la validación de firma binaria
  // pero usar un códec que el navegador no sepa decodificar.
  const handlePlaybackError = useCallback(() => {
    revokeCurrentUrl()
    setState({
      status: 'error',
      file: null,
      videoUrl: null,
      duration: null,
      errorMessage: 'El navegador no pudo reproducir este vídeo. Prueba con otro archivo.',
    })
  }, [revokeCurrentUrl])

  const reset = useCallback(() => {
    revokeCurrentUrl()
    setState(INITIAL_STATE)
  }, [revokeCurrentUrl])

  // Limpieza al desmontar el componente que use este hook.
  useEffect(() => {
    return () => {
      revokeCurrentUrl()
    }
  }, [revokeCurrentUrl])

  return {
    status: state.status,
    file: state.file,
    videoUrl: state.videoUrl,
    duration: state.duration,
    errorMessage: state.errorMessage,
    selectFile,
    handleMetadataLoaded,
    handlePlaybackError,
    reset,
  }
}
