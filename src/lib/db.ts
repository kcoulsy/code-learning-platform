import Dexie, { type EntityTable } from 'dexie'

const OPENAI_MODELS = ["gpt-5.2", "gpt-5.2-pro", "gpt-5.2-chat-latest", "gpt-5.1", "gpt-5.1-codex", "gpt-5", "gpt-5-mini", "gpt-5-nano", "gpt-5-pro", "gpt-5-codex", "o3", "o3-pro", "o3-mini", "o4-mini", "o3-deep-research", "o4-mini-deep-research", "gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano", "gpt-4", "gpt-4-turbo", "gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo", "gpt-audio", "gpt-audio-mini", "gpt-4o-audio", "gpt-4o-mini-audio", "gpt-5.1-chat-latest", "gpt-5-chat-latest", "chatgpt-4o-latest", "gpt-5.1-codex-mini", "codex-mini-latest", "gpt-4o-search-preview", "gpt-4o-mini-search-preview", "computer-use-preview", "o1", "o1-pro"] as const;
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
  openai: OPENAI_MODELS.map((model) => ({
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
