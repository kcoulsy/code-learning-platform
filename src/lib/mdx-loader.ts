import { readFile, readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import matter from 'gray-matter'
import { z } from 'zod/v4'
import { createServerFn } from '@tanstack/react-start'

const CONTENT_DIR = join(process.cwd(), 'content')

export interface MDXMetadata {
  [key: string]: any
}

export interface MDXContent {
  metadata: MDXMetadata
  content: string
}

async function readMDXFile(filePath: string): Promise<MDXContent> {
  const fileContent = await readFile(filePath, 'utf-8')
  const { data, content } = matter(fileContent)

  return {
    metadata: data,
    content: content.trim(),
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath)
    return true
  } catch {
    return false
  }
}

async function isDirectory(filePath: string): Promise<boolean> {
  try {
    const stats = await stat(filePath)
    return stats.isDirectory()
  } catch {
    return false
  }
}

// Server function to get course metadata
export const getCourseMeta = createServerFn()
  .inputValidator(
    z.object({
      courseId: z.string(),
    }),
  )
  .handler(async ({ data }: { data: { courseId: string } }) => {
    const coursePath = join(CONTENT_DIR, data.courseId, 'course.mdx')

    if (!(await fileExists(coursePath))) {
      return null
    }

    return readMDXFile(coursePath)
  })

// Server function to get all lessons for a course
export const getLessons = createServerFn()
  .inputValidator(
    z.object({
      courseId: z.string(),
    }),
  )
  .handler(async ({ data }: { data: { courseId: string } }) => {
    const lessonsPath = join(CONTENT_DIR, data.courseId, 'lessons')

    if (!(await fileExists(lessonsPath))) {
      return []
    }

    const lessonDirs = await readdir(lessonsPath)

    const lessons = await Promise.all(
      lessonDirs.map(async (lessonId) => {
        const lessonPath = join(lessonsPath, lessonId)
        if (!(await isDirectory(lessonPath))) {
          return null
        }

        const lessonMetaPath = join(lessonPath, 'lesson.mdx')
        if (!(await fileExists(lessonMetaPath))) {
          return null
        }

        const lessonData = await readMDXFile(lessonMetaPath)
        return {
          id: lessonId,
          ...lessonData,
        }
      }),
    )

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
      const lessonPath = join(
        CONTENT_DIR,
        data.courseId,
        'lessons',
        data.lessonId,
        'lesson.mdx',
      )

      if (!(await fileExists(lessonPath))) {
        return null
      }

      return readMDXFile(lessonPath)
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
      const stepsPath = join(
        CONTENT_DIR,
        data.courseId,
        'lessons',
        data.lessonId,
        'steps',
      )

      if (!(await fileExists(stepsPath))) {
        return []
      }

      const stepDirs = await readdir(stepsPath)

      const steps = await Promise.all(
        stepDirs.map(async (stepId) => {
          const stepPath = join(stepsPath, stepId)
          if (!(await isDirectory(stepPath))) {
            return null
          }

          const stepFilePath = join(stepPath, 'step.mdx')
          if (!(await fileExists(stepFilePath))) {
            return null
          }

          const stepData = await readMDXFile(stepFilePath)
          return {
            id: stepId,
            ...stepData,
          }
        }),
      )

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
      const stepPath = join(
        CONTENT_DIR,
        data.courseId,
        'lessons',
        data.lessonId,
        'steps',
        data.stepId,
        'step.mdx',
      )

      if (!(await fileExists(stepPath))) {
        return null
      }

      return readMDXFile(stepPath)
    },
  )

// Server function to load all courses
export const loadAllCourses = createServerFn().handler(async () => {
  const courseIds = ['learning-c', 'advanced-c'] // Can be dynamically discovered later

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
