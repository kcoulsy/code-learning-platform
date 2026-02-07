import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from './auth-client'
import {
  getUserSettings,
  updateUserSettings,
  deleteUserSettings,
} from './progress-api'

const CONFIG_KEY = 'userSettings'

export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'ollama'
  model: string
  apiKey: string
}

/**
 * Get AI configuration and management functions
 */
export function useAIConfig() {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const queryClient = useQueryClient()

  const { data: settings, isLoading } = useQuery({
    queryKey: [CONFIG_KEY, userId],
    queryFn: async () => {
      if (!userId) return null
      return await getUserSettings({ data: { userId } })
    },
    enabled: !!userId,
  })

  const config: AIConfig | null = settings
    ? {
        provider: settings.aiProvider as 'openai' | 'anthropic' | 'ollama',
        model: settings.aiModel || '',
        apiKey: settings.apiKey || '',
      }
    : null

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<AIConfig>) => {
      if (!userId) throw new Error('Not authenticated')
      await updateUserSettings({
        data: {
          userId,
          aiProvider: updates.provider,
          aiModel: updates.model,
          apiKey: updates.apiKey,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_KEY, userId] })
    },
  })

  const updateConfig = useCallback(
    (updates: Partial<AIConfig>) => {
      updateMutation.mutate(updates)
    },
    [updateMutation],
  )

  const clearMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not authenticated')
      await deleteUserSettings({ data: { userId } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_KEY, userId] })
    },
  })

  const clearConfig = useCallback(() => {
    clearMutation.mutate()
  }, [clearMutation])

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

    if (
      config.provider === 'anthropic' &&
      !config.apiKey.startsWith('sk-ant-')
    ) {
      return false
    }

    return true
  }, [config])

  return {
    config,
    updateConfig,
    clearConfig,
    hasValidConfig: hasValidConfig(),
    isLoading,
    isUpdating: updateMutation.isPending,
    isUpdateSuccess: updateMutation.isSuccess,
    updateError: updateMutation.error,
  }
}
