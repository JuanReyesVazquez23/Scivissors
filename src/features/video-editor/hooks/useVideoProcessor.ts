import { useCallback, useEffect, useRef, useState } from 'react'
import type { ProcessedSegment, ProcessingStatus, VideoSegment } from '../types'
import { clampRatio } from '../utils/clampRatio'
import { cutVideoSegments, revokeProcessedSegments, VideoProcessingError } from '../services/videoProcessor'
import type { CutProgress } from '../services/videoProcessor'

export function useVideoProcessor() {
  const [status, setStatus] = useState<ProcessingStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<ProcessedSegment[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Refs que reflejan el último valor de results/status, para poder leerlos
  // desde closures que deliberadamente no dependen de ellos (evita tanto
  // recrear processSegments en cada cambio de estado como el bug clásico de
  // "closure obsoleto" en la limpieza al desmontar.
  const resultsRef = useRef<ProcessedSegment[]>([])
  const statusRef = useRef<ProcessingStatus>('idle')

  useEffect(() => {
    resultsRef.current = results
  }, [results])

  useEffect(() => {
    statusRef.current = status
  }, [status])

  const processSegments = useCallback(async (file: File, segments: VideoSegment[]) => {
    // Evita procesos simultáneos si esta función se llama dos veces muy
    // seguido (ej. doble tap) antes de que React re-renderice.
    if (statusRef.current === 'loading-ffmpeg' || statusRef.current === 'processing') {
      return
    }
    statusRef.current = 'loading-ffmpeg'

    revokeProcessedSegments(resultsRef.current)
    setStatus('loading-ffmpeg')
    setProgress(0)
    setErrorMessage(null)
    setResults([])

    const handleProgress = (cutProgress: CutProgress) => {
      statusRef.current = 'processing'
      setStatus('processing')
      const overall = (cutProgress.segmentIndex + cutProgress.ratio) / cutProgress.totalSegments
      setProgress(clampRatio(overall))
    }

    try {
      const processed = await cutVideoSegments(file, segments, handleProgress)
      setResults(processed)
      setProgress(1)
      statusRef.current = 'success'
      setStatus('success')
    } catch (error) {
      const message =
        error instanceof VideoProcessingError ? error.message : 'Ocurrió un error inesperado al procesar el vídeo.'
      setErrorMessage(message)
      statusRef.current = 'error'
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    revokeProcessedSegments(resultsRef.current)
    setResults([])
    setStatus('idle')
    statusRef.current = 'idle'
    setProgress(0)
    setErrorMessage(null)
  }, [])

  // Limpieza al desmontar: usa el ref para tener siempre el valor más
  // reciente de results, no el que había cuando se montó el componente.
  useEffect(() => {
    return () => {
      revokeProcessedSegments(resultsRef.current)
    }
  }, [])

  return { status, progress, results, errorMessage, processSegments, reset }
}
