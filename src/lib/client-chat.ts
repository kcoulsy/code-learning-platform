import { openaiText } from '@tanstack/ai-openai'
import { anthropicText } from '@tanstack/ai-anthropic'
import { ollamaText } from '@tanstack/ai-ollama'
import { chat, type ModelMessage } from '@tanstack/ai'
import type { AIConfig } from './db'

export async function streamClientChat(
  config: AIConfig,
  messages: ModelMessage[],
  systemPrompt: string
) {
  let adapter

  switch (config.provider) {
    case 'openai':
      adapter = openaiText(config.model, {
        apiKey: config.apiKey,
      })
      break

    case 'anthropic':
      adapter = anthropicText(config.model, {
        apiKey: config.apiKey,
      })
      break

    case 'ollama':
      adapter = ollamaText(config.model)
      break

    default:
      throw new Error(`Unsupported provider: ${config.provider}`)
  }

  return chat({
    adapter,
    messages,
    systemPrompts: [systemPrompt],
  })
}
