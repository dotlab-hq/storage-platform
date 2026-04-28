type LegacyChunkPayload = {
  chunk?: string
  done?: boolean
  id?: string
  error?: string
}

type OpenAiChunkChoice = {
  delta?: {
    content?: string
  }
  finish_reason?: string | null
}

type OpenAiChunkPayload = {
  id?: string
  object?: string
  choices?: OpenAiChunkChoice[]
  error?: {
    message?: string
  }
}

export type ParsedChatStreamEvent =
  | { type: 'chunk'; chunk: string; messageId: string | null }
  | { type: 'done'; messageId: string | null }
  | { type: 'error'; message: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readLegacyPayload(payload: unknown): LegacyChunkPayload | null {
  if (!isRecord(payload)) {
    return null
  }

  return {
    chunk: typeof payload.chunk === 'string' ? payload.chunk : undefined,
    done: typeof payload.done === 'boolean' ? payload.done : undefined,
    id: typeof payload.id === 'string' ? payload.id : undefined,
    error: typeof payload.error === 'string' ? payload.error : undefined,
  }
}

function readOpenAiPayload(payload: unknown): OpenAiChunkPayload | null {
  if (!isRecord(payload)) {
    return null
  }

  const choices = Array.isArray(payload.choices)
    ? payload.choices.filter(isRecord).map((choice) => {
        const delta = isRecord(choice.delta)
          ? {
              content:
                typeof choice.delta.content === 'string'
                  ? choice.delta.content
                  : undefined,
            }
          : undefined

        return {
          delta,
          finish_reason:
            typeof choice.finish_reason === 'string' ||
            choice.finish_reason === null
              ? choice.finish_reason
              : undefined,
        }
      })
    : undefined

  const error = isRecord(payload.error)
    ? {
        message:
          typeof payload.error.message === 'string'
            ? payload.error.message
            : undefined,
      }
    : undefined

  return {
    id: typeof payload.id === 'string' ? payload.id : undefined,
    object: typeof payload.object === 'string' ? payload.object : undefined,
    choices,
    error,
  }
}

function parseEventPayload(payload: string): ParsedChatStreamEvent | null {
  const trimmed = payload.trim()

  if (trimmed.length === 0) {
    return null
  }

  if (trimmed === '[DONE]') {
    return { type: 'done', messageId: null }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    return null
  }

  const legacy = readLegacyPayload(parsed)
  if (legacy?.error) {
    return { type: 'error', message: legacy.error }
  }

  if (legacy?.done) {
    return { type: 'done', messageId: legacy.id ?? null }
  }

  if (legacy?.chunk) {
    return {
      type: 'chunk',
      chunk: legacy.chunk,
      messageId: legacy.id ?? null,
    }
  }

  const openAi = readOpenAiPayload(parsed)
  if (openAi?.error?.message) {
    return { type: 'error', message: openAi.error.message }
  }

  if (openAi?.object === 'chat.completion.chunk') {
    const choice = openAi.choices?.[0]
    const chunk = choice?.delta?.content

    if (typeof chunk === 'string' && chunk.length > 0) {
      return {
        type: 'chunk',
        chunk,
        messageId: openAi.id ?? null,
      }
    }

    if (typeof choice?.finish_reason === 'string') {
      return {
        type: 'done',
        messageId: openAi.id ?? null,
      }
    }
  }

  return null
}

export function consumeSseEvents(buffer: string): {
  rest: string
  events: ParsedChatStreamEvent[]
} {
  const eventBlocks = buffer.split('\n\n')
  const rest = eventBlocks.pop() ?? ''
  const events: ParsedChatStreamEvent[] = []

  for (const block of eventBlocks) {
    const payload = block
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trimStart())
      .join('\n')

    const parsed = parseEventPayload(payload)
    if (parsed) {
      events.push(parsed)
    }
  }

  return { rest, events }
}
