'use client'

import { useState, useEffect, useCallback } from 'react'

interface ExerciseProgress {
  [stepId: string]: {
    [exerciseIndex: number]: boolean
  }
}

const STORAGE_KEY = 'exercise-progress'

export function useExerciseProgress(stepId: string) {
  const [progress, setProgress] = useState<ExerciseProgress>({})
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          setProgress(JSON.parse(stored))
        }
      } catch (e) {
        console.error('Failed to load exercise progress:', e)
      }
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
      } catch (e) {
        console.error('Failed to save exercise progress:', e)
      }
    }
  }, [progress, isLoaded])

  const isComplete = useCallback(
    (exerciseIndex: number): boolean => {
      return progress[stepId]?.[exerciseIndex] ?? false
    },
    [progress, stepId],
  )

  const toggleComplete = useCallback(
    (exerciseIndex: number): void => {
      setProgress((prev) => ({
        ...prev,
        [stepId]: {
          ...prev[stepId],
          [exerciseIndex]: !prev[stepId]?.[exerciseIndex],
        },
      }))
    },
    [stepId],
  )

  const setCompleted = useCallback(
    (exerciseIndex: number, completed: boolean): void => {
      setProgress((prev) => ({
        ...prev,
        [stepId]: {
          ...prev[stepId],
          [exerciseIndex]: completed,
        },
      }))
    },
    [stepId],
  )

  const getCompletedCount = useCallback((): number => {
    const stepProgress = progress[stepId] ?? {}
    return Object.values(stepProgress).filter(Boolean).length
  }, [progress, stepId])

  const getTotalCount = useCallback((totalExercises: number): number => {
    return totalExercises
  }, [])

  return {
    isComplete,
    toggleComplete,
    setCompleted,
    getCompletedCount,
    getTotalCount,
    isLoaded,
  }
}
