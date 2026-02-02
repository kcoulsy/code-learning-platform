import type { QueryClient } from '@tanstack/react-query'
import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'

// Step progress data model
export interface StepProgress {
  id: string // Composite key: "courseId:itemId:stepId"
  courseId: string
  itemId: string // Lesson or project ID
  stepId: string
  completed: boolean
  completedAt: Date | null
}

// Lesson progress data model
export interface LessonProgress {
  id: string // Composite key: "courseId:itemId"
  courseId: string
  itemId: string // Lesson or project ID
  completed: boolean
  manuallySet: boolean // True if user manually toggled (overrides auto-calculation)
  completedAt: Date | null
}

// Course visit tracking
export interface CourseVisit {
  id: string // courseId
  courseId: string
  lastItemId: string // Last visited lesson/project
  lastStepId: string // Last visited step
  lastVisitedAt: Date
}

// Collections will be initialized with QueryClient
export let stepProgressCollection: ReturnType<typeof createCollection<StepProgress>>
export let lessonProgressCollection: ReturnType<typeof createCollection<LessonProgress>>
export let courseVisitCollection: ReturnType<typeof createCollection<CourseVisit>>

export function initializeCollections(queryClient: QueryClient) {
  // Step progress collection
  stepProgressCollection = createCollection<StepProgress>(
    queryCollectionOptions({
      queryClient,
      queryKey: ['step-progress'],
      queryFn: async () => {
        // Start empty, loads from IndexedDB automatically
        return []
      },
      getKey: (item) => item.id,
      persistenceOptions: {
        storage: 'indexeddb',
        storageKey: 'learncode-step-progress',
      },
      // Local-only handlers (persistence handled by IndexedDB)
      onInsert: async () => {
        // No server sync needed
      },
      onUpdate: async () => {
        // No server sync needed
      },
      onDelete: async () => {
        // No server sync needed
      },
    })
  )

  // Lesson progress collection
  lessonProgressCollection = createCollection<LessonProgress>(
    queryCollectionOptions({
      queryClient,
      queryKey: ['lesson-progress'],
      queryFn: async () => {
        return []
      },
      getKey: (item) => item.id,
      persistenceOptions: {
        storage: 'indexeddb',
        storageKey: 'learncode-lesson-progress',
      },
      // Local-only handlers (persistence handled by IndexedDB)
      onInsert: async () => {
        // No server sync needed
      },
      onUpdate: async () => {
        // No server sync needed
      },
      onDelete: async () => {
        // No server sync needed
      },
    })
  )

  // Course visit collection
  courseVisitCollection = createCollection<CourseVisit>(
    queryCollectionOptions({
      queryClient,
      queryKey: ['course-visit'],
      queryFn: async () => {
        return []
      },
      getKey: (item) => item.id,
      persistenceOptions: {
        storage: 'indexeddb',
        storageKey: 'learncode-course-visit',
      },
      // Local-only handlers (persistence handled by IndexedDB)
      onInsert: async () => {
        // No server sync needed
      },
      onUpdate: async () => {
        // No server sync needed
      },
      onDelete: async () => {
        // No server sync needed
      },
    })
  )
}
