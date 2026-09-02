import { useCallback, useRef, useState } from 'react'
import type { VideoSegment } from '../types'
import { validateManualSegment } from '../utils/segmentValidation'
import type { SegmentValidationResult } from '../utils/segmentValidation'

/**
 * A diferencia de los segmentos automáticos (derivados de duration), los
 * manuales son estado real: el usuario decide exactamente cuáles existen.
 */
export function useManualSegments(durationSeconds: number | null) {
  const [segments, setSegments] = useState<VideoSegment[]>([])
  const nextIdRef = useRef(1)

  const addSegment = useCallback(
    (startTime: number | null, endTime: number | null): SegmentValidationResult => {
      const result = validateManualSegment(startTime, endTime, durationSeconds)

      if (result.valid) {
        const id = `manual-${nextIdRef.current}`
        nextIdRef.current += 1
        setSegments((prev) => [...prev, { id, startTime: result.startTime, endTime: result.endTime }])
      }

      return result
    },
    [durationSeconds],
  )

  const removeSegment = useCallback((id: string) => {
    setSegments((prev) => prev.filter((segment) => segment.id !== id))
  }, [])

  const reset = useCallback(() => {
    setSegments([])
    nextIdRef.current = 1
  }, [])

  return { segments, addSegment, removeSegment, reset }
}
