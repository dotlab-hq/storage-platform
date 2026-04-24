import type {
  BaseMessage} from '@langchain/core/messages';
import {
  HumanMessage,
  SystemMessage
} from '@langchain/core/messages'
import { generateAssistantReplyStream as newGenerateStream } from './-chat-llm-streamer'

const CHAT_SYSTEM_PROMPT =
  'You are Barrage Chat, a practical engineering assistant. Answer clearly and directly in markdown. When useful, include short bullet points and concise code blocks. Be concise and helpful.'

const CHARACTER_STREAM_DELAY_MS = 20

/**
 * Backward-compatible wrapper for original API.
 * Converts single-prompt calls to the new BaseMessage[] format.
 */
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
    // Convert to BaseMessage format for new streamer
    const messages: BaseMessage[] = [
      new SystemMessage(CHAT_SYSTEM_PROMPT),
      new HumanMessage(compactPrompt),
    ]

    // Call new streamer with old signature compatibility
    const stream = newGenerateStream(messages, {
      streamDelayMs: CHARACTER_STREAM_DELAY_MS,
    })

    for await (const chunk of stream) {
      if (signal?.aborted) {
        break
      }

      if (chunk.type === 'content' && chunk.content) {
        yield chunk.content
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return
    }

    console.error('[Chat] LLM Stream Error:', error)

    const suffix = priorCount > 0 ? ` (variation #${priorCount + 1})` : ''
    const truncatedPrompt =
      compactPrompt.length > 220
        ? `${compactPrompt.slice(0, 220)}...`
        : compactPrompt

    yield `
**Response**${suffix}:

Here is a quick first-pass response while I refine a fuller answer:

- Main request: ${truncatedPrompt}
- Suggested next step: share any constraints or expected output format.
- If this is code-related: include language, runtime, and current error details for a precise fix.
`.trim()
  }
}
