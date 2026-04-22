import { HumanMessage, SystemMessage } from '@langchain/core/messages'

const CHAT_SYSTEM_PROMPT =
  'You are Barrage Chat, a practical engineering assistant. Answer clearly and directly in markdown. When useful, include short bullet points and concise code blocks. Be concise and helpful.'

const CHARACTER_STREAM_DELAY_MS = 20

type LlmChunkLike = {
  content?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function extractChunkText(rawChunk: unknown): string {
  if (!isRecord(rawChunk)) {
    return ''
  }

  const chunk = rawChunk as LlmChunkLike
  const { content } = chunk

  if (typeof content === 'string') {
    return content
  }

  if (!Array.isArray(content)) {
    return ''
  }

  return content
    .map((part) => {
      if (typeof part === 'string') {
        return part
      }

      if (!isRecord(part)) {
        return ''
      }

      const text = part.text
      return typeof text === 'string' ? text : ''
    })
    .join('')
}

async function delay(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) {
    return
  }

  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)

    const onAbort = () => {
      clearTimeout(timeout)
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }

    signal?.addEventListener('abort', onAbort)
  })
}

async function* streamWithCadence(
  text: string,
  signal?: AbortSignal,
): AsyncGenerator<string, void, unknown> {
  for (const character of text) {
    if (signal?.aborted) {
      return
    }

    yield character
    await delay(CHARACTER_STREAM_DELAY_MS, signal)
  }
}

export async function* generateAssistantReplyStream(
  prompt: string,
  priorCount: number,
  signal?: AbortSignal,
): AsyncGenerator<string, void, unknown> {
  const compactPrompt = prompt.trim().replace(/\s+/g, ' ')

  if (compactPrompt.length === 0) {
    yield 'I received an empty message. How can I assist you today?'
    return
  }

  try {
    const { llm } = await import('@/llm/gemini.llm')

    const messages = [
      new SystemMessage(CHAT_SYSTEM_PROMPT),
      new HumanMessage(compactPrompt),
    ]

    // Use streaming API from LangChain
    const stream = await llm.stream(messages, {
      signal,
    })

    for await (const chunk of stream) {
      if (signal?.aborted) {
        break
      }

      const content = extractChunkText(chunk)
      if (content.length > 0) {
        for await (const character of streamWithCadence(content, signal)) {
          yield character
        }
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      // Graceful abort
      return
    }

    console.error('[Chat] LLM Stream Error:', {
      message: error instanceof Error ? error.message : String(error),
      type: error instanceof Error ? error.constructor.name : typeof error,
    })

    const suffix = priorCount > 0 ? ` (variation #${priorCount + 1})` : ''
    const truncatedPrompt =
      compactPrompt.length > 220
        ? `${compactPrompt.slice(0, 220)}...`
        : compactPrompt

    yield [
      `**Response**${suffix}:`,
      '',
      'Here is a quick first-pass response while I refine a fuller answer:',
      '',
      `- Main request: ${truncatedPrompt}`,
      '- Suggested next step: share any constraints or expected output format.',
      '- If this is code-related: include language, runtime, and current error details for a precise fix.',
    ].join('\n')
  }
}
