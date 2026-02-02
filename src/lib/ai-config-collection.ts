import type { QueryClient } from '@tanstack/react-query'
import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'

// AI provider configuration data model
export interface AIConfig {
  id: string // 'default' (singleton pattern)
  provider: 'openai' | 'anthropic' | 'ollama'
  model: string
  apiKey: string
  createdAt: Date
  updatedAt: Date
}

// Provider-specific model lists
export const PROVIDER_MODELS = {
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  ],
  anthropic: [
    { value: 'claude-opus-4-5', label: 'Claude Opus 4.5' },
    { value: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5' },
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
  ],
  ollama: [
    { value: 'llama3.2', label: 'Llama 3.2' },
    { value: 'llama3.1', label: 'Llama 3.1' },
    { value: 'mistral', label: 'Mistral' },
    { value: 'codellama', label: 'Code Llama' },
  ],
} as const

// Collection will be initialized with QueryClient
export let aiConfigCollection: ReturnType<typeof createCollection<AIConfig>>

export function initializeAIConfigCollection(queryClient: QueryClient) {
  aiConfigCollection = createCollection<AIConfig>(
    queryCollectionOptions({
      queryClient,
      queryKey: ['ai-config'],
      queryFn: async () => {
        // Start empty, loads from IndexedDB automatically
        return []
      },
      getKey: (item) => item.id,
      persistenceOptions: {
        storage: 'indexeddb',
        storageKey: 'learncode-ai-config',
      },
    })
  )
}
