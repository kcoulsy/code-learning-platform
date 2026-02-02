import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { ollama } from 'ollama-ai-provider'
import type { AIConfig } from './db'

// Types for compatibility with existing consumers
export interface ModelMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export type StreamChunk =
  | { type: 'content'; delta: string }
  | { type: 'done' }
  | { type: 'error'; error: Error }

export async function* streamClientChat(
  config: AIConfig,
  messages: ModelMessage[],
  systemPrompt: string
): AsyncGenerator<StreamChunk, void, unknown> {
  console.log('streamClientChat', config, messages, systemPrompt)

  try {
    let model

    switch (config.provider) {
      case 'openai': {
        const openai = createOpenAI({
          apiKey: config.apiKey,
        })
        model = openai(config.model)
        break
      }

      case 'anthropic': {
        const anthropic = createAnthropic({
          apiKey: config.apiKey,
        })
        model = anthropic(config.model)
        break
      }

      case 'ollama': {
        model = ollama(config.model)
        break
      }

      default:
        throw new Error(`Unsupported provider: ${config.provider}`)
    }

    const result = streamText({
      model,
      messages,
      system: systemPrompt,
    })

    // Compatibility wrapper: adapt Vercel AI SDK stream to TanStack AI chunk format
    for await (const textPart of result.textStream) {
      yield { type: 'content', delta: textPart }
    }

    yield { type: 'done' }
  } catch (error) {
    yield {
      type: 'error',
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}
