import { useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from './auth-client'
import type { Course, CourseItem } from './course-data'
import type { StepProgress, LessonProgress } from '@/db/schema'
import {
  getStepProgress,
  updateStepProgress,
  deleteStepProgress,
  getLessonProgress,
  updateLessonProgress,
  deleteLessonProgress,
  getCourseStepProgress,
  getCourseLessonProgress,
  getCourseVisit,
  updateCourseVisit,
} from './progress-api'

// Query keys for cache management
const progressKeys = {
  step: (userId: string, courseId: string, itemId: string, stepId: string) => [
    'stepProgress',
    userId,
    courseId,
    itemId,
    stepId,
  ],
  lesson: (userId: string, courseId: string, itemId: string) => [
    'lessonProgress',
    userId,
    courseId,
    itemId,
  ],
  courseSteps: (userId: string, courseId: string) => [
    'courseStepProgress',
    userId,
    courseId,
  ],
  courseLessons: (userId: string, courseId: string) => [
    'courseLessonProgress',
    userId,
    courseId,
  ],
  courseVisit: (userId: string, courseId: string) => [
    'courseVisit',
    userId,
    courseId,
  ],
}

/**
 * Get step completion status and toggle function
 */
export function useStepCompletion(
  courseId: string,
  itemId: string,
  stepId: string,
) {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: progressKeys.step(userId || '', courseId, itemId, stepId),
    queryFn: async () => {
      if (!userId) return null
      return await getStepProgress({
        data: { userId, courseId, itemId, stepId },
      })
    },
    enabled: !!userId,
  })

  const isComplete = data?.completed ?? false

  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not authenticated')
      if (isComplete) {
        await deleteStepProgress({ data: { userId, courseId, itemId, stepId } })
      } else {
        await updateStepProgress({
          data: { userId, courseId, itemId, stepId, completed: true },
        })
      }
    },
    onSuccess: () => {
      // Invalidate step progress
      queryClient.invalidateQueries({
        queryKey: progressKeys.step(userId || '', courseId, itemId, stepId),
      })
      // Invalidate course progress
      queryClient.invalidateQueries({
        queryKey: progressKeys.courseSteps(userId || '', courseId),
      })
    },
  })

  const markCompleteMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not authenticated')
      await updateStepProgress({
        data: { userId, courseId, itemId, stepId, completed: true },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: progressKeys.step(userId || '', courseId, itemId, stepId),
      })
      queryClient.invalidateQueries({
        queryKey: progressKeys.courseSteps(userId || '', courseId),
      })
    },
  })

  const toggle = useCallback(() => {
    toggleMutation.mutate()
  }, [toggleMutation])

  const markComplete = useCallback(() => {
    if (!isComplete) {
      markCompleteMutation.mutate()
    }
  }, [isComplete, markCompleteMutation])

  return { isComplete, toggle, markComplete, isLoading }
}

/**
 * Get lesson completion status and toggle function
 */
export function useLessonCompletion(courseId: string, itemId: string) {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: progressKeys.lesson(userId || '', courseId, itemId),
    queryFn: async () => {
      if (!userId) return null
      return await getLessonProgress({ data: { userId, courseId, itemId } })
    },
    enabled: !!userId,
  })

  const isComplete = data?.completed ?? false
  const manuallySet = data?.manuallySet ?? false

  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not authenticated')
      if (isComplete) {
        await deleteLessonProgress({ data: { userId, courseId, itemId } })
      } else {
        await updateLessonProgress({
          data: {
            userId,
            courseId,
            itemId,
            completed: true,
            manuallySet: true,
          },
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: progressKeys.lesson(userId || '', courseId, itemId),
      })
      queryClient.invalidateQueries({
        queryKey: progressKeys.courseLessons(userId || '', courseId),
      })
    },
  })

  const toggle = useCallback(() => {
    toggleMutation.mutate()
  }, [toggleMutation])

  return { isComplete, manuallySet, toggle, isLoading }
}

/**
 * Get course progress percentage and stats
 */
export function useCourseProgress(courseId: string, course: Course) {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const { data: completedSteps, isLoading } = useQuery({
    queryKey: progressKeys.courseSteps(userId || '', courseId),
    queryFn: async () => {
      if (!userId) return []
      return await getCourseStepProgress({ data: { userId, courseId } })
    },
    enabled: !!userId,
  })

  const totalSteps = course.items.reduce(
    (sum, item) => sum + item.steps.length,
    0,
  )
  const completedCount = completedSteps?.length ?? 0
  const percentage =
    totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0

  return { percentage, completedCount, totalSteps, isLoading }
}

/**
 * Get completion status for all steps in a course (for outline view)
 */
export function useCourseOutlineProgress(courseId: string) {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const { data: completedSteps, isLoading: stepsLoading } = useQuery({
    queryKey: progressKeys.courseSteps(userId || '', courseId),
    queryFn: async () => {
      if (!userId) return []
      return await getCourseStepProgress({ data: { userId, courseId } })
    },
    enabled: !!userId,
  })

  const { data: completedLessons, isLoading: lessonsLoading } = useQuery({
    queryKey: progressKeys.courseLessons(userId || '', courseId),
    queryFn: async () => {
      if (!userId) return []
      return await getCourseLessonProgress({ data: { userId, courseId } })
    },
    enabled: !!userId,
  })

  const completedStepsMap = new Map<string, StepProgress>()
  completedSteps?.forEach((step) => {
    completedStepsMap.set(
      `${step.courseId}:${step.itemId}:${step.stepId}`,
      step,
    )
  })

  const completedLessonsMap = new Map<string, LessonProgress>()
  completedLessons?.forEach((lesson) => {
    completedLessonsMap.set(`${lesson.courseId}:${lesson.itemId}`, lesson)
  })

  const isStepComplete = (itemId: string, stepId: string) => {
    return completedStepsMap.has(`${courseId}:${itemId}:${stepId}`)
  }

  const isLessonComplete = (itemId: string) => {
    return completedLessonsMap.has(`${courseId}:${itemId}`)
  }

  const getLessonProgress = (item: CourseItem) => {
    const completedStepCount = item.steps.filter((step) =>
      isStepComplete(item.id, step.id),
    ).length
    return {
      completed: completedStepCount,
      total: item.steps.length,
      percentage:
        item.steps.length > 0
          ? Math.round((completedStepCount / item.steps.length) * 100)
          : 0,
    }
  }

  return {
    isStepComplete,
    isLessonComplete,
    getLessonProgress,
    isLoading: stepsLoading || lessonsLoading,
  }
}

/**
 * Track last visited step for a course
 */
export function useTrackVisit(
  courseId: string,
  itemId: string,
  stepId: string,
) {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!userId) return

    const updateVisit = async () => {
      await updateCourseVisit({
        data: { userId, courseId, lastItemId: itemId, lastStepId: stepId },
      })
      queryClient.invalidateQueries({
        queryKey: progressKeys.courseVisit(userId, courseId),
      })
    }

    updateVisit()
  }, [userId, courseId, itemId, stepId, queryClient])
}

/**
 * Get last visited step for a course
 */
export function useLastVisit(courseId: string) {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const { data, isLoading } = useQuery({
    queryKey: progressKeys.courseVisit(userId || '', courseId),
    queryFn: async () => {
      if (!userId) return null
      return await getCourseVisit({ data: { userId, courseId } })
    },
    enabled: !!userId,
  })

  return { data: data ?? null, isLoading }
}

/**
 * Get next incomplete step for a course
 */
export function useNextIncompleteStep(courseId: string, course: Course) {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const { data: completedSteps, isLoading } = useQuery({
    queryKey: progressKeys.courseSteps(userId || '', courseId),
    queryFn: async () => {
      if (!userId) return []
      return await getCourseStepProgress({ data: { userId, courseId } })
    },
    enabled: !!userId,
  })

  const completedStepsSet = new Set(
    completedSteps?.map((s) => `${s.courseId}:${s.itemId}:${s.stepId}`) ?? [],
  )

  // Find first incomplete step
  for (const item of course.items) {
    for (const step of item.steps) {
      const compositeId = `${courseId}:${item.id}:${step.id}`
      if (!completedStepsSet.has(compositeId)) {
        return { itemId: item.id, stepId: step.id, isLoading }
      }
    }
  }

  // All steps complete, return first step
  if (course.items.length > 0 && course.items[0].steps.length > 0) {
    return {
      itemId: course.items[0].id,
      stepId: course.items[0].steps[0].id,
      isLoading,
    }
  }

  return { itemId: null, stepId: null, isLoading }
}

/**
 * Auto-complete lesson when all steps are done (unless manually overridden)
 */
export function useAutoLessonComplete(
  courseId: string,
  itemId: string,
  totalSteps: number,
) {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const queryClient = useQueryClient()

  const { data: completedSteps } = useQuery({
    queryKey: ['autoCompleteSteps', userId || '', courseId, itemId],
    queryFn: async () => {
      if (!userId) return []
      const allSteps = await getCourseStepProgress({
        data: { userId, courseId },
      })
      return allSteps.filter((s) => s.itemId === itemId)
    },
    enabled: !!userId,
  })

  const { data: lessonData } = useQuery({
    queryKey: ['autoCompleteLesson', userId || '', courseId, itemId],
    queryFn: async () => {
      if (!userId) return null
      return await getLessonProgress({ data: { userId, courseId, itemId } })
    },
    enabled: !!userId,
  })

  useEffect(() => {
    if (!userId) return

    const autoComplete = async () => {
      const allStepsComplete = (completedSteps?.length ?? 0) === totalSteps

      // Only auto-complete if not manually set and all steps are done
      if (allStepsComplete && totalSteps > 0 && !lessonData?.manuallySet) {
        await updateLessonProgress({
          data: {
            userId,
            courseId,
            itemId,
            completed: true,
            manuallySet: false,
          },
        })
        queryClient.invalidateQueries({
          queryKey: progressKeys.lesson(userId, courseId, itemId),
        })
      }
      // Auto-uncomplete if manually set to complete but not all steps are done
      else if (
        !allStepsComplete &&
        lessonData?.completed &&
        !lessonData?.manuallySet
      ) {
        await deleteLessonProgress({ data: { userId, courseId, itemId } })
        queryClient.invalidateQueries({
          queryKey: progressKeys.lesson(userId, courseId, itemId),
        })
      }
    }

    autoComplete()
  }, [
    completedSteps,
    totalSteps,
    lessonData,
    courseId,
    itemId,
    userId,
    queryClient,
  ])
}
