import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { db } from '@/db'
import { userSettings } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { decryptUserKey, decryptApiKey } from '@/lib/auth'

export const APIRoute = createAPIFileRoute('/api/chat')({
  POST: async ({ request }) => {
    try {
      // Parse request body
      const body = await request.json()
      const { courseId, itemId, stepId, messages, systemPrompt } = body

      // Get user session from request
      // Note: In a real implementation, you'd verify the session here
      // For now, we'll extract userId from a header or cookie
      const userId = request.headers.get('x-user-id')

      if (!userId) {
        return json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Get user's AI configuration
      const settings = await db.query.userSettings.findFirst({
        where: eq(userSettings.userId, userId),
      })

      if (!settings?.encryptedApiKey || !settings?.keyEncryptionKey) {
        return json({ error: 'AI configuration not found' }, { status: 400 })
      }

      // Decrypt the user's API key
      const userKey = decryptUserKey(settings.keyEncryptionKey)
      const apiKey = decryptApiKey(settings.encryptedApiKey, userKey)

      // Import AI SDKs dynamically
      const { streamText } = await import('ai')
      const { createOpenAI } = await import('@ai-sdk/openai')
      const { createAnthropic } = await import('@ai-sdk/anthropic')
      const { ollama } = await import('ollama-ai-provider')

      let model

      switch (settings.aiProvider) {
        case 'openai': {
          const openai = createOpenAI({ apiKey })
          model = openai(settings.aiModel!)
          break
        }
        case 'anthropic': {
          const anthropic = createAnthropic({ apiKey })
          model = anthropic(settings.aiModel!)
          break
        }
        case 'ollama': {
          model = ollama(settings.aiModel!)
          break
        }
        default:
          return json({ error: 'Unsupported AI provider' }, { status: 400 })
      }

      // Stream the response
      const result = streamText({
        model,
        messages,
        system: systemPrompt,
      })

      // Return the stream directly
      return result.toDataStreamResponse()
    } catch (error) {
      console.error('Chat API error:', error)
      return json(
        {
          error:
            error instanceof Error ? error.message : 'Internal server error',
        },
        { status: 500 },
      )
    }
  },
})
