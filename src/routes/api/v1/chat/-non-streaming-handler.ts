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
  const { generateAssistantReplyStream } =
    await import('@/routes/_app/chat/-chat-llm-streamer')

  let fullContent = ''
  let toolCalls: OpenAiToolCall[] = []
  let usage: Usage | null = null

  for await (const chunk of generateAssistantReplyStream(
    params.messages,
    params.params,
  )) {
    if (chunk.type === 'content') {
      fullContent += chunk.content
    } else if (chunk.type === 'final') {
      toolCalls = chunk.toolCalls || []
      usage = chunk.usage || usage

      if (chunk.finishReason === 'tool_calls') {
        const toolResults = await executeToolCalls(toolCalls)
        fullContent += '\n\nTool Results:\n'
        for (const result of toolResults) {
          fullContent += result.error
            ? `Error: ${result.error}\n`
            : `${result.result}\n`
        }
      }
    }
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
      content:
        typeof msg.content === 'string'
          ? msg.content
          : JSON.stringify(msg.content),
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
}
