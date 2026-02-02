// Re-export server functions
export {
  getCourseMeta,
  getLessons,
  getLessonMeta,
  getSteps,
  getStepContent,
  loadAllCourses,
  loadCourse
} from './mdx-loader'

export interface Step {
  id: string
  title: string
  content: string // Markdown content
}

export interface Lesson {
  id: string
  title: string
  description: string
  type: "lesson"
  steps: Step[]
}

export interface Project {
  id: string
  title: string
  description: string
  type: "project"
  steps: Step[]
}

export type CourseItem = Lesson | Project

export interface Course {
  id: string
  title: string
  description: string
  items: CourseItem[]
}
