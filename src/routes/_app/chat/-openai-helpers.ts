import type {
  OpenAiChunk,
  OpenAiCompletion,
  OpenAiToolCall,
} from '@/routes/api/v1/-schemas'
import type { Usage } from '@/lib/token-counter'

/**
 * Build OpenAI streaming chunk
 */
export function toOpenAiChunk({
  id,
  created,
  model,
  delta,
  finishReason,
}: {
  id: string
  created: number
  model: string
  delta: {
    role?: string
    content?: string
    reasoning_content?: string
    tool_calls?: any[]
  }
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null
}): OpenAiChunk {
  return {
    id,
    object: 'chat.completion.chunk',
    created,
    model,
    choices: [
      {
        index: 0,
        delta: {
          role: delta.role as
            | 'assistant'
            | 'user'
            | 'system'
            | 'tool'
            | undefined,
          content: delta.content,
          reasoning_content: delta.reasoning_content,
          tool_calls: delta.tool_calls,
        },
        finish_reason: finishReason,
      },
    ],
  }
}
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null
}): OpenAiChunk {
  return {
    id,
    object: 'chat.completion.chunk',
    created,
    model,
    choices: [
      {
        index: 0,
        delta: {
          role: delta.role as
            | 'assistant'
            | 'user'
            | 'system'
            | 'tool'
            | undefined,
          content: delta.content,
          reasoning: delta.reasoning,
          tool_calls: delta.tool_calls,
        },
        finish_reason: finishReason,
      },
    ],
  }
}

/**
 * Build final streaming chunk with usage and system_fingerprint
 */
export function toOpenAiChunkWithUsage({
  id,
  created,
  model,
  usage,
  systemFingerprint,
}: {
  id: string
  created: number
  model: string
  usage: Usage
  systemFingerprint: string
}): OpenAiChunk {
  return {
    id,
    object: 'chat.completion.chunk',
    created,
    model,
    choices: [
      {
        index: 0,
        delta: {},
        finish_reason: 'stop',
      },
    ],
    usage,
    system_fingerprint: systemFingerprint,
  }
}

/**
 * Build non-streaming completion response
 */
export function toOpenAiCompletion({
  id,
  created,
  model,
  content,
  toolCalls,
  usage,
  systemFingerprint,
}: {
  id: string
  created: number
  model: string
  content: string
  toolCalls?: OpenAiToolCall[]
  usage: Usage
  systemFingerprint: string
}): OpenAiCompletion {
  return {
    id,
    object: 'chat.completion',
    created,
    model,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content,
          ...(toolCalls && toolCalls.length > 0
            ? { tool_calls: toolCalls }
            : {}),
        },
        finish_reason:
          toolCalls && toolCalls.length > 0 ? 'tool_calls' : 'stop',
      },
    ],
    usage,
    system_fingerprint: systemFingerprint,
  }
}

/**
 * Format payload as SSE event line
 */
export function toSseEvent(payload: unknown | '[DONE]'): string {
  if (payload === '[DONE]') {
    return 'data: [DONE]\n\n'
  }
  return `data: ${JSON.stringify(payload)}\n\n`
}
