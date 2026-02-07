import { z } from 'zod/v4'
import { createServerFn } from '@tanstack/react-start'
import * as contentBundle from './content-bundle'

export interface MDXMetadata {
  [key: string]: any
}

export interface MDXContent {
  metadata: MDXMetadata
  content: string
}

// Server function to get course metadata
export const getCourseMeta = createServerFn()
  .inputValidator(
    z.object({
      courseId: z.string(),
    }),
  )
  .handler(async ({ data }: { data: { courseId: string } }) => {
    return contentBundle.getCourseMeta(data.courseId)
  })

// Server function to get all lessons for a course
export const getLessons = createServerFn()
  .inputValidator(
    z.object({
      courseId: z.string(),
    }),
  )
  .handler(async ({ data }: { data: { courseId: string } }) => {
    const lessonIds = contentBundle.getLessonIds(data.courseId)

    const lessons = lessonIds.map((lessonId) => {
      const lessonData = contentBundle.getLessonMeta(data.courseId, lessonId)
      if (!lessonData) return null
      return {
        id: lessonId,
        ...lessonData,
      }
    })

    return lessons
      .filter(Boolean)
      .sort((a, b) => (a!.metadata.order || 0) - (b!.metadata.order || 0))
  })

// Server function to get lesson metadata
export const getLessonMeta = createServerFn()
  .inputValidator(
    z.object({
      courseId: z.string(),
      lessonId: z.string(),
    }),
  )
  .handler(
    async ({ data }: { data: { courseId: string; lessonId: string } }) => {
      return contentBundle.getLessonMeta(data.courseId, data.lessonId)
    },
  )

// Server function to get all steps for a lesson
export const getSteps = createServerFn()
  .inputValidator(
    z.object({
      courseId: z.string(),
      lessonId: z.string(),
    }),
  )
  .handler(
    async ({ data }: { data: { courseId: string; lessonId: string } }) => {
      const stepIds = contentBundle.getStepIds(data.courseId, data.lessonId)

      const steps = stepIds.map((stepId) => {
        const stepData = contentBundle.getStepContent(
          data.courseId,
          data.lessonId,
          stepId,
        )
        if (!stepData) return null
        return {
          id: stepId,
          ...stepData,
        }
      })

      return steps
        .filter(Boolean)
        .sort((a, b) => (a!.metadata.order || 0) - (b!.metadata.order || 0))
    },
  )

// Server function to get step content
export const getStepContent = createServerFn()
  .inputValidator(
    z.object({
      courseId: z.string(),
      lessonId: z.string(),
      stepId: z.string(),
    }),
  )
  .handler(
    async ({
      data,
    }: {
      data: { courseId: string; lessonId: string; stepId: string }
    }) => {
      return contentBundle.getStepContent(
        data.courseId,
        data.lessonId,
        data.stepId,
      )
    },
  )

// Server function to load all courses
export const loadAllCourses = createServerFn().handler(async () => {
  // const courseIds = [
  //   'learning-c',
  //   'data-structures',
  //   'algorithms',
  //   'advanced-c',
  //   'tcp-server',
  //   'http-server',
  //   'build-database',
  // ] // Ordered by recommended completion sequence
  const courseIds = contentBundle.getCourseIds()

  const courses = await Promise.all(
    courseIds.map(async (courseId) => {
      const courseMeta = await getCourseMeta({ data: { courseId } })
      if (!courseMeta) return null

      const lessons = await getLessons({ data: { courseId } })

      const items = await Promise.all(
        lessons.map(async (lessonData) => {
          if (!lessonData) return null

          const steps = await getSteps({
            data: { courseId, lessonId: lessonData.id },
          })

          const lessonSteps = steps
            .map((stepData) => {
              if (!stepData) return null

              return {
                id: stepData.id,
                title: stepData.metadata.title,
                content: stepData.content,
              }
            })
            .filter(
              (step): step is { id: string; title: string; content: string } =>
                step !== null,
            )

          return {
            id: lessonData.id,
            title: lessonData.metadata.title,
            description: lessonData.metadata.description,
            type: lessonData.metadata.type || 'lesson',
            steps: lessonSteps,
          }
        }),
      )

      return {
        id: courseId,
        title: courseMeta.metadata.title,
        description: courseMeta.metadata.description,
        items: items.filter((item): item is any => item !== null),
      }
    }),
  )

  return courses.filter((course): course is any => course !== null)
})

// Server function to load a single course with all its data
export const loadCourse = createServerFn()
  .inputValidator(
    z.object({
      courseId: z.string(),
    }),
  )
  .handler(async ({ data }: { data: { courseId: string } }) => {
    const courseMeta = await getCourseMeta({
      data: { courseId: data.courseId },
    })
    if (!courseMeta) return null

    const lessons = await getLessons({ data: { courseId: data.courseId } })

    const items = await Promise.all(
      lessons.map(async (lessonData) => {
        if (!lessonData) return null

        const steps = await getSteps({
          data: { courseId: data.courseId, lessonId: lessonData.id },
        })

        const lessonSteps = steps
          .map((stepData) => {
            if (!stepData) return null

            return {
              id: stepData.id,
              title: stepData.metadata.title,
              content: stepData.content,
            }
          })
          .filter(
            (step): step is { id: string; title: string; content: string } =>
              step !== null,
          )

        return {
          id: lessonData.id,
          title: lessonData.metadata.title,
          description: lessonData.metadata.description,
          type: lessonData.metadata.type || 'lesson',
          steps: lessonSteps,
        }
      }),
    )

    return {
      id: data.courseId,
      title: courseMeta.metadata.title,
      description: courseMeta.metadata.description,
      items: items.filter((item): item is any => item !== null),
    }
  })
