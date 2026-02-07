import matter from 'gray-matter'

// Import all MDX files at build time using Vite's glob import
// Use relative path from src/lib to content directory
const contentFiles = import.meta.glob('../../content/**/*.mdx', {
  query: '?raw',
  eager: true,
  import: 'default',
}) as Record<string, string>

export interface MDXContent {
  metadata: Record<string, any>
  content: string
}

function parseMDX(raw: string): MDXContent {
  const { data, content } = matter(raw)
  return {
    metadata: data,
    content: content.trim(),
  }
}

// Get all bundled content paths
export function getContentPaths(): string[] {
  return Object.keys(contentFiles)
}

// Path prefix used by import.meta.glob
const PATH_PREFIX = '../../content/'

// Get raw content by path (internal path format)
export function getContent(path: string): MDXContent | null {
  const raw = contentFiles[path]
  if (!raw) return null
  return parseMDX(raw)
}

// Get course metadata
export function getCourseMeta(courseId: string): MDXContent | null {
  return getContent(`${PATH_PREFIX}${courseId}/course.mdx`)
}

// Get all lesson IDs for a course
export function getLessonIds(courseId: string): string[] {
  const prefix = `${PATH_PREFIX}${courseId}/lessons/`
  const lessonPaths = Object.keys(contentFiles).filter(
    (p) => p.startsWith(prefix) && p.endsWith('/lesson.mdx'),
  )
  return lessonPaths.map((p) => {
    const relativePath = p.slice(prefix.length)
    return relativePath.split('/')[0]
  })
}

// Get lesson metadata
export function getLessonMeta(
  courseId: string,
  lessonId: string,
): MDXContent | null {
  return getContent(`${PATH_PREFIX}${courseId}/lessons/${lessonId}/lesson.mdx`)
}

// Get all step IDs for a lesson
export function getStepIds(courseId: string, lessonId: string): string[] {
  const prefix = `${PATH_PREFIX}${courseId}/lessons/${lessonId}/steps/`
  const stepPaths = Object.keys(contentFiles).filter(
    (p) => p.startsWith(prefix) && p.endsWith('/step.mdx'),
  )
  return stepPaths.map((p) => {
    const relativePath = p.slice(prefix.length)
    return relativePath.split('/')[0]
  })
}

// Get step content
export function getStepContent(
  courseId: string,
  lessonId: string,
  stepId: string,
): MDXContent | null {
  return getContent(
    `${PATH_PREFIX}${courseId}/lessons/${lessonId}/steps/${stepId}/step.mdx`,
  )
}

// Get all available course IDs sorted by order metadata
export function getCourseIds(): string[] {
  const coursePaths = Object.keys(contentFiles).filter((p) =>
    p.endsWith('/course.mdx'),
  )

  const courses = coursePaths
    .map((p) => {
      // Extract course ID from ../../content/{courseId}/course.mdx
      const match = p.match(/content\/([^/]+)\/course\.mdx$/)
      const courseId = match ? match[1] : ''

      // Get the course metadata to read the order
      const courseMeta = courseId ? getContent(p) : null
      const order = courseMeta?.metadata?.order || 0

      return { courseId, order }
    })
    .filter((c): c is { courseId: string; order: number } => c.courseId !== '')

  // Sort by order
  courses.sort((a, b) => a.order - b.order)

  return courses.map((c) => c.courseId)
}
