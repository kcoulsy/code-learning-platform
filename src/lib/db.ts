import Dexie, { type EntityTable } from 'dexie'
import { OPENAI_CHAT_MODELS } from '@tanstack/ai-openai'

// for some reason not exported from the library
const ANTHROPIC_MODELS = ['claude-opus-4-5', 'claude-sonnet-4-5', 'claude-haiku-4-5', 'claude-opus-4-1', 'claude-sonnet-4', 'claude-3-7-sonnet', 'claude-opus-4', 'claude-3-5-haiku', 'claude-3-haiku'] as const

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

// AI provider configuration data model
export interface AIConfig {
  id: string // 'default' (singleton pattern)
  provider: 'openai' | 'anthropic' | 'ollama'
  model: string
  apiKey: string
  createdAt: Date
  updatedAt: Date
}

// Helper function to format model names for display
function formatModelName(modelId: string): string {
  // Handle special cases
  const specialCases: Record<string, string> = {
    'gpt-4o': 'GPT-4o',
    'gpt-4o-mini': 'GPT-4o Mini',
    'gpt-4-turbo': 'GPT-4 Turbo',
    'gpt-3.5-turbo': 'GPT-3.5 Turbo',
  }

  if (specialCases[modelId]) {
    return specialCases[modelId]
  }

  // Generic formatting: capitalize and clean up
  return modelId
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

// Provider-specific model lists
export const PROVIDER_MODELS = {
  openai: OPENAI_CHAT_MODELS.map((model) => ({
    value: model,
    label: formatModelName(model),
  })),
  anthropic: ANTHROPIC_MODELS.map((model) => ({
    value: model,
    label: formatModelName(model),
  })),
  ollama: [
    { value: 'llama3.2', label: 'Llama 3.2' },
    { value: 'llama3.1', label: 'Llama 3.1' },
    { value: 'mistral', label: 'Mistral' },
    { value: 'codellama', label: 'Code Llama' },
  ],
} as const

// Database class with TypeScript typing
const db = new Dexie('LearnCodeDB') as Dexie & {
  stepProgress: EntityTable<StepProgress, 'id'>
  lessonProgress: EntityTable<LessonProgress, 'id'>
  courseVisits: EntityTable<CourseVisit, 'id'>
  aiConfig: EntityTable<AIConfig, 'id'>
}

// Schema declaration
db.version(1).stores({
  stepProgress: 'id, courseId, itemId, stepId, completed',
  lessonProgress: 'id, courseId, itemId, completed',
  courseVisits: 'id, courseId, lastVisitedAt',
  aiConfig: 'id, provider',
})

export { db }
