import { useCallback } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type AIConfig } from './db'

const CONFIG_ID = 'default'

/**
 * Get AI configuration and management functions
 */
export function useAIConfig() {
  const config = useLiveQuery(() => db.aiConfig.get(CONFIG_ID))

  const updateConfig = useCallback(
    (updates: Partial<Omit<AIConfig, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const now = new Date()
      const existingConfig = config

      db.aiConfig.put({
        id: CONFIG_ID,
        provider: updates.provider ?? existingConfig?.provider ?? 'openai',
        model: updates.model ?? existingConfig?.model ?? '',
        apiKey: updates.apiKey ?? existingConfig?.apiKey ?? '',
        createdAt: existingConfig?.createdAt ?? now,
        updatedAt: now,
      })
    },
    [config]
  )

  const clearConfig = useCallback(() => {
    db.aiConfig.delete(CONFIG_ID)
  }, [])

  const hasValidConfig = useCallback(() => {
    if (!config) return false

    // Check provider is set
    if (!config.provider) return false

    // Check model is set
    if (!config.model) return false

    // Check API key for non-Ollama providers
    if (config.provider !== 'ollama' && !config.apiKey) return false

    // Validate API key format for specific providers
    if (config.provider === 'openai' && !config.apiKey.startsWith('sk-')) {
      return false
    }

    if (config.provider === 'anthropic' && !config.apiKey.startsWith('sk-ant-')) {
      return false
    }

    return true
  }, [config])

  return {
    config: config ?? null,
    updateConfig,
    clearConfig,
    hasValidConfig: hasValidConfig(),
  }
}
