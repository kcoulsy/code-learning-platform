import { useCallback, useEffect } from 'react'
import { useLiveQuery } from '@tanstack/react-db'
import { and, eq } from '@tanstack/db'
import {
  stepProgressCollection,
  lessonProgressCollection,
  courseVisitCollection,
  type StepProgress,
  type LessonProgress,
  type CourseVisit,
} from './progress-collections'
import type { Course, CourseItem } from './course-data'

/**
 * Get step completion status and toggle function
 */
export function useStepCompletion(courseId: string, itemId: string, stepId: string) {
  const compositeId = `${courseId}:${itemId}:${stepId}`

  const { data } = useLiveQuery((q) =>
    q
      .from({ step: stepProgressCollection })
      .where(({ step }) => eq(step.id, compositeId))
      .orderBy(({ step }) => step.id, 'desc')
      .limit(1)
  )

  const isComplete = data?.[0]?.completed ?? false

  const toggle = useCallback(() => {
    if (isComplete) {
      stepProgressCollection.delete(compositeId)
    } else {
      stepProgressCollection.insert({
        id: compositeId,
        courseId,
        itemId,
        stepId,
        completed: true,
        completedAt: new Date(),
      })
    }
  }, [isComplete, compositeId, courseId, itemId, stepId])

  const markComplete = useCallback(() => {
    if (!isComplete) {
      stepProgressCollection.insert({
        id: compositeId,
        courseId,
        itemId,
        stepId,
        completed: true,
        completedAt: new Date(),
      })
    }
  }, [isComplete, compositeId, courseId, itemId, stepId])

  return { isComplete, toggle, markComplete }
}

/**
 * Get lesson completion status and toggle function
 */
export function useLessonCompletion(courseId: string, itemId: string) {
  const compositeId = `${courseId}:${itemId}`

  const { data } = useLiveQuery((q) =>
    q
      .from({ lesson: lessonProgressCollection })
      .where(({ lesson }) => eq(lesson.id, compositeId))
      .orderBy(({ lesson }) => lesson.id, 'desc')
      .limit(1)
  )

  const isComplete = data?.[0]?.completed ?? false
  const manuallySet = data?.[0]?.manuallySet ?? false

  const toggle = useCallback(() => {
    if (isComplete) {
      lessonProgressCollection.delete(compositeId)
    } else {
      lessonProgressCollection.insert({
        id: compositeId,
        courseId,
        itemId,
        completed: true,
        manuallySet: true, // User manually toggled
        completedAt: new Date(),
      })
    }
  }, [isComplete, compositeId, courseId, itemId])

  return { isComplete, manuallySet, toggle }
}

/**
 * Get course progress percentage and stats
 */
export function useCourseProgress(courseId: string, course: Course) {
  const { data: completedSteps } = useLiveQuery((q) =>
    q.from({ step: stepProgressCollection }).where(({ step }) => eq(step.courseId, courseId))
  )

  const totalSteps = course.items.reduce((sum, item) => sum + item.steps.length, 0)
  const completedCount = completedSteps?.length ?? 0
  const percentage = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0

  return { percentage, completedCount, totalSteps }
}

/**
 * Get completion status for all steps in a course (for outline view)
 */
export function useCourseOutlineProgress(courseId: string) {
  const { data: completedSteps } = useLiveQuery((q) =>
    q.from({ step: stepProgressCollection }).where(({ step }) => eq(step.courseId, courseId))
  )

  const { data: completedLessons } = useLiveQuery((q) =>
    q.from({ lesson: lessonProgressCollection }).where(({ lesson }) => eq(lesson.courseId, courseId))
  )

  const completedStepsMap = new Map<string, StepProgress>()
  completedSteps?.forEach((step) => {
    completedStepsMap.set(step.id, step)
  })

  const completedLessonsMap = new Map<string, LessonProgress>()
  completedLessons?.forEach((lesson) => {
    completedLessonsMap.set(lesson.id, lesson)
  })

  const isStepComplete = (itemId: string, stepId: string) => {
    const compositeId = `${courseId}:${itemId}:${stepId}`
    return completedStepsMap.has(compositeId)
  }

  const isLessonComplete = (itemId: string) => {
    const compositeId = `${courseId}:${itemId}`
    return completedLessonsMap.has(compositeId)
  }

  const getLessonProgress = (item: CourseItem) => {
    const completedStepCount = item.steps.filter((step) => isStepComplete(item.id, step.id)).length
    return {
      completed: completedStepCount,
      total: item.steps.length,
      percentage: item.steps.length > 0 ? Math.round((completedStepCount / item.steps.length) * 100) : 0,
    }
  }

  return { isStepComplete, isLessonComplete, getLessonProgress }
}

/**
 * Track last visited step for a course
 */
export function useTrackVisit(courseId: string, itemId: string, stepId: string) {
  useEffect(() => {
    courseVisitCollection.insert({
      id: courseId,
      courseId,
      lastItemId: itemId,
      lastStepId: stepId,
      lastVisitedAt: new Date(),
    })
  }, [courseId, itemId, stepId])
}

/**
 * Get last visited step for a course
 */
export function useLastVisit(courseId: string) {
  const { data } = useLiveQuery((q) =>
    q
      .from({ visit: courseVisitCollection })
      .where(({ visit }) => eq(visit.courseId, courseId))
      .orderBy(({ visit }) => visit.lastVisitedAt, 'desc')
      .limit(1)
  )

  return data?.[0] ?? null
}

/**
 * Get next incomplete step for a course
 */
export function useNextIncompleteStep(courseId: string, course: Course) {
  const { data: completedSteps } = useLiveQuery((q) =>
    q.from({ step: stepProgressCollection }).where(({ step }) => eq(step.courseId, courseId))
  )

  const completedStepsSet = new Set(completedSteps?.map((s) => s.id) ?? [])

  // Find first incomplete step
  for (const item of course.items) {
    for (const step of item.steps) {
      const compositeId = `${courseId}:${item.id}:${step.id}`
      if (!completedStepsSet.has(compositeId)) {
        return { itemId: item.id, stepId: step.id }
      }
    }
  }

  // All steps complete, return first step
  if (course.items.length > 0 && course.items[0].steps.length > 0) {
    return {
      itemId: course.items[0].id,
      stepId: course.items[0].steps[0].id,
    }
  }

  return null
}

/**
 * Auto-complete lesson when all steps are done (unless manually overridden)
 */
export function useAutoLessonComplete(courseId: string, itemId: string, totalSteps: number) {
  const { data: completedSteps } = useLiveQuery((q) =>
    q
      .from({ step: stepProgressCollection })
      .where(({ step }) => and(eq(step.courseId, courseId), eq(step.itemId, itemId)))
  )

  const { data: lessonProgress } = useLiveQuery((q) =>
    q
      .from({ lesson: lessonProgressCollection })
      .where(({ lesson }) => eq(lesson.id, `${courseId}:${itemId}`))
      .orderBy(({ lesson }) => lesson.id, 'desc')
      .limit(1)
  )

  useEffect(() => {
    const allStepsComplete = completedSteps?.length === totalSteps
    const lessonData = lessonProgress?.[0]

    // Only auto-complete if not manually set and all steps are done
    if (allStepsComplete && totalSteps > 0 && !lessonData?.manuallySet) {
      const compositeId = `${courseId}:${itemId}`
      lessonProgressCollection.insert({
        id: compositeId,
        courseId,
        itemId,
        completed: true,
        manuallySet: false,
        completedAt: new Date(),
      })
    }
    // Auto-uncomplete if manually set to complete but not all steps are done
    else if (!allStepsComplete && lessonData?.completed && !lessonData?.manuallySet) {
      lessonProgressCollection.delete(`${courseId}:${itemId}`)
    }
  }, [completedSteps, totalSteps, lessonProgress, courseId, itemId])
}
