import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from './auth-client'
import { getStepChats, saveStepChats, deleteStepChats } from './progress-api'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface StepChat {
  stepId: string
  messages: ChatMessage[]
}

const CHATS_KEY = 'stepChats'

/**
 * Hook to manage chat messages for a step
 */
export function useStepChat(courseId: string, itemId: string, stepId: string) {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const queryClient = useQueryClient()

  const { data: messages = [], isLoading } = useQuery({
    queryKey: [CHATS_KEY, userId, courseId, itemId, stepId],
    queryFn: async () => {
      if (!userId) return []
      return await getStepChats({ data: { userId, courseId, itemId, stepId } })
    },
    enabled: !!userId,
  })

  const saveMutation = useMutation({
    mutationFn: async (newMessages: ChatMessage[]) => {
      if (!userId) throw new Error('Not authenticated')
      await saveStepChats({
        data: { userId, courseId, itemId, stepId, messages: newMessages },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CHATS_KEY, userId, courseId, itemId, stepId],
      })
    },
  })

  const clearMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not authenticated')
      await deleteStepChats({ data: { userId, courseId, itemId, stepId } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CHATS_KEY, userId, courseId, itemId, stepId],
      })
    },
  })

  return {
    messages,
    saveMessages: saveMutation.mutate,
    clearMessages: clearMutation.mutate,
    isLoading,
  }
}

// Legacy functions for backward compatibility during migration
export function getChatKey(
  courseId: string,
  itemId: string,
  stepId: string,
): string {
  return `${courseId}:${itemId}:${stepId}`
}

export function getAllChats(): Record<string, StepChat> {
  return {}
}

export function getStepChat(
  courseId: string,
  itemId: string,
  stepId: string,
): ChatMessage[] {
  return []
}

export function saveStepChat(
  courseId: string,
  itemId: string,
  stepId: string,
  messages: ChatMessage[],
): void {
  // No-op - migrated to server
}

export function clearStepChat(
  courseId: string,
  itemId: string,
  stepId: string,
): void {
  // No-op - migrated to server
}
