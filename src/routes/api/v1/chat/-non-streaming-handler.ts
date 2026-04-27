import { json } from '@tanstack/react-start'
import { db } from '@/db'
import { chatMessage } from '@/db/schema/chat'
import type { BaseMessage } from '@langchain/core/messages'
import { executeToolCalls } from '@/routes/_app/chat/tools/-tool-executor'
import { toOpenAiCompletion } from '@/routes/_app/chat/-openai-helpers'
import {
  calculateUsage,
  type Usage,
  SYSTEM_FINGERPRINT,
} from '@/lib/token-counter'
import { refreshThreadLatestMessage } from '@/routes/_app/chat/-chat-server-db'
import type { LLMStreamParams } from '@/routes/_app/chat/-chat-llm-streamer'
import type { OpenAiToolCall } from '@/routes/api/v1/-schemas'
import { normalizeOpenAiContent } from '@/utils/normalize-openai-message'

export interface NonStreamingHandlerParams {
  messages: BaseMessage[]
  params: LLMStreamParams
  threadId: string
  userId: string
  userMessageId: string
  model: string
}

export async function handleNonStreamingResponse(
  params: NonStreamingHandlerParams,
) {
  try {
    const { generateAssistantReplyStream } =
      await import('@/routes/_app/chat/-chat-llm-streamer')

    let fullContent = ''
    let toolCalls: OpenAiToolCall[] = []
    let usage: Usage | null = null
    let errorMessage: string | null = null

    try {
      for await (const chunk of generateAssistantReplyStream(
        params.messages,
        params.params,
      )) {
        if (chunk.type === 'content') {
          fullContent += chunk.content
        } else if (chunk.type === 'error' && chunk.error) {
          errorMessage = chunk.error
          break
        } else if (chunk.type === 'final') {
          toolCalls = chunk.toolCalls || []
          usage = chunk.usage || usage

          if (chunk.finishReason === 'tool_calls') {
            const toolResults = await executeToolCalls(
              toolCalls,
              params.userId,
              params.threadId,
            )
            fullContent += '\n\nTool Results:\n'
            for (const result of toolResults) {
              fullContent += result.error
                ? `Error: ${result.error}\n`
                : `${result.result}\n`
            }
          }
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      console.error('[NonStreamingHandler] LLM error:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
      })

      // Provide user-friendly error messages
      const errorMsg = err.message.toLowerCase()
      if (errorMsg.includes('api key') || errorMsg.includes('authentication')) {
        errorMessage = 'Invalid or missing API key for language model.'
      } else if (
        errorMsg.includes('quota') ||
        errorMsg.includes('rate limit')
      ) {
        errorMessage =
          'Language model API quota exceeded. Please try again later.'
      } else if (errorMsg.includes('internal')) {
        errorMessage = 'Language model service error. Please try again.'
      } else {
        errorMessage = `Error: ${err.message}`
      }
    }

    // If we got an error, return it as an error response
    if (errorMessage) {
      return json(
        {
          error: {
            message: errorMessage,
            type: 'invalid_request_error',
            code: 'llm_error',
          },
        },
        { status: 500 },
      )
    }

    const [assistantMessage] = await db
      .insert(chatMessage)
      .values({
        threadId: params.threadId,
        userId: params.userId,
        role: 'assistant',
        content: fullContent,
        toolCalls: toolCalls.length > 0 ? JSON.stringify(toolCalls) : null,
        regenerationCount: 0,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: chatMessage.id })

    // Refresh thread stats
    await refreshThreadLatestMessage(params.threadId)

    // Compute final usage if not provided
    let finalUsage = usage
    if (!finalUsage) {
      const messagesForUsage = params.messages.map((msg) => ({
        role: msg.getType(),
        content: normalizeOpenAiContent(msg.content).text,
      }))
      finalUsage = calculateUsage(messagesForUsage, fullContent)
    }

    return json(
      toOpenAiCompletion({
        id: `chatcmpl-${assistantMessage.id}`,
        created: Math.floor(Date.now() / 1000),
        model: params.model,
        content: fullContent,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        usage: finalUsage,
        systemFingerprint: SYSTEM_FINGERPRINT,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Thread-Id': params.threadId,
          'X-Assistant-Message-Id': assistantMessage.id,
          'X-User-Message-Id': params.userMessageId,
        },
      },
    )
  } catch (error) {
    console.error('[NonStreamingHandler] Unexpected error:', error)
    return json(
      {
        error: {
          message:
            'An unexpected error occurred while processing your request.',
          type: 'server_error',
          code: 'internal_error',
        },
      },
      { status: 500 },
    )
  }
}
