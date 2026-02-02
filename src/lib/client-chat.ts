import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { ollama } from 'ollama-ai-provider'
import { streamText, type CoreMessage } from 'ai'
import type { AIConfig } from './ai-config-collection'

export async function streamClientChat(
  config: AIConfig,
  messages: CoreMessage[],
  systemPrompt: string
) {
  let modelInstance

  switch (config.provider) {
    case 'openai':
      const openai = createOpenAI({
        apiKey: config.apiKey,
        dangerouslyAllowBrowser: true,
      })
      modelInstance = openai(config.model)
      break

    case 'anthropic':
      const anthropic = createAnthropic({
        apiKey: config.apiKey,
        dangerouslyAllowBrowser: true,
      })
      modelInstance = anthropic(config.model)
      break

    case 'ollama':
      modelInstance = ollama(config.model)
      break

    default:
      throw new Error(`Unsupported provider: ${config.provider}`)
  }

  return streamText({
    model: modelInstance,
    system: systemPrompt,
    messages,
  })
}
