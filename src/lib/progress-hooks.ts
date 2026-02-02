import { useCallback, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type StepProgress, type LessonProgress } from './db'
import type { Course, CourseItem } from './course-data'

/**
 * Get step completion status and toggle function
 */
export function useStepCompletion(courseId: string, itemId: string, stepId: string) {
  const compositeId = `${courseId}:${itemId}:${stepId}`

  const data = useLiveQuery(() => db.stepProgress.where('id').equals(compositeId).first())

  const isComplete = data?.completed ?? false

  const toggle = useCallback(() => {
    if (isComplete) {
      db.stepProgress.delete(compositeId)
    } else {
      db.stepProgress.add({
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
      db.stepProgress.add({
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

  const data = useLiveQuery(() => db.lessonProgress.where('id').equals(compositeId).first())

  const isComplete = data?.completed ?? false
  const manuallySet = data?.manuallySet ?? false

  const toggle = useCallback(() => {
    if (isComplete) {
      db.lessonProgress.delete(compositeId)
    } else {
      db.lessonProgress.add({
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
  const completedSteps = useLiveQuery(() =>
    db.stepProgress.where('courseId').equals(courseId).toArray()
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
  const completedSteps = useLiveQuery(() =>
    db.stepProgress.where('courseId').equals(courseId).toArray()
  )

  const completedLessons = useLiveQuery(() =>
    db.lessonProgress.where('courseId').equals(courseId).toArray()
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
    const updateVisit = async () => {
      const existingVisit = await db.courseVisits.get(courseId)
      if (existingVisit) {
        await db.courseVisits.update(courseId, {
          lastItemId: itemId,
          lastStepId: stepId,
          lastVisitedAt: new Date(),
        })
      } else {
        await db.courseVisits.add({
          id: courseId,
          courseId,
          lastItemId: itemId,
          lastStepId: stepId,
          lastVisitedAt: new Date(),
        })
      }
    }
    updateVisit()
  }, [courseId, itemId, stepId])
}

/**
 * Get last visited step for a course
 */
export function useLastVisit(courseId: string) {
  const data = useLiveQuery(() => db.courseVisits.where('courseId').equals(courseId).first())

  return data ?? null
}

/**
 * Get next incomplete step for a course
 */
export function useNextIncompleteStep(courseId: string, course: Course) {
  const completedSteps = useLiveQuery(() =>
    db.stepProgress.where('courseId').equals(courseId).toArray()
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
  const completedSteps = useLiveQuery(() =>
    db.stepProgress.where({ courseId, itemId }).toArray()
  )

  const lessonProgress = useLiveQuery(() =>
    db.lessonProgress.where('id').equals(`${courseId}:${itemId}`).first()
  )

  useEffect(() => {
    const autoComplete = async () => {
      const allStepsComplete = completedSteps?.length === totalSteps
      const lessonData = lessonProgress

      // Only auto-complete if not manually set and all steps are done
      if (allStepsComplete && totalSteps > 0 && !lessonData?.manuallySet) {
        const compositeId = `${courseId}:${itemId}`
        const existingLesson = await db.lessonProgress.get(compositeId)
        if (existingLesson) {
          await db.lessonProgress.update(compositeId, {
            completed: true,
            manuallySet: false,
            completedAt: new Date(),
          })
        } else {
          await db.lessonProgress.add({
            id: compositeId,
            courseId,
            itemId,
            completed: true,
            manuallySet: false,
            completedAt: new Date(),
          })
        }
      }
      // Auto-uncomplete if manually set to complete but not all steps are done
      else if (!allStepsComplete && lessonData?.completed && !lessonData?.manuallySet) {
        await db.lessonProgress.delete(`${courseId}:${itemId}`)
      }
    }
    autoComplete()
  }, [completedSteps, totalSteps, lessonProgress, courseId, itemId])
}
