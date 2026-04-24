import { db } from '@/db'
import { chatMessage } from '@/db/schema/chat'
import { eq } from 'drizzle-orm'
import type { BaseMessage } from '@langchain/core/messages'
import { AIMessage, ToolMessage } from '@langchain/core/messages'
import { executeToolCalls } from '@/routes/_app/chat/tools/-tool-executor'
import {
  toOpenAiChunk,
  toOpenAiChunkWithUsage,
  toSseEvent,
} from '@/routes/_app/chat/-openai-helpers'
import { type Usage, SYSTEM_FINGERPRINT } from '@/lib/token-counter'
import { refreshThreadLatestMessage } from '@/routes/_app/chat/-chat-server-db'
import type { LLMStreamParams } from '@/routes/_app/chat/-chat-llm-streamer'
import type { OpenAiToolCall } from '@/routes/api/v1/-schemas'

export interface StreamingHandlerParams {
  messages: BaseMessage[]
  params: LLMStreamParams
  threadId: string
  userId: string
  userMessageId: string
  model: string
}

export async function handleStreamingResponse(params: StreamingHandlerParams) {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        let currentMessages = [...params.messages]
        let assistantMessageId: string | null = null
        let combinedContent = ''
        let allToolCalls: OpenAiToolCall[] = []
        let finalUsage: Usage | null = null
        let iteration = 0
        const MAX_ITERATIONS = 10

        while (iteration < MAX_ITERATIONS) {
          iteration++

          const { generateAssistantReplyStream } =
            await import('@/routes/_app/chat/-chat-llm-streamer')

          for await (const chunk of generateAssistantReplyStream(
            currentMessages,
            params.params,
          )) {
            if (chunk.type === 'content') {
              combinedContent += chunk.content
              controller.enqueue(
                encoder.encode(
                  toSseEvent(
                    toOpenAiChunk({
                      id: `chatcmpl-${assistantMessageId || 'pending'}`,
                      created: Math.floor(Date.now() / 1000),
                      model: params.model,
                      delta: { content: chunk.content },
                      finishReason: null,
                    }),
                  ),
                ),
              )
            } else if (chunk.type === 'reasoning') {
              // Send reasoning content separately with reasoning_content field
              controller.enqueue(
                encoder.encode(
                  toSseEvent(
                    toOpenAiChunk({
                      id: `chatcmpl-${assistantMessageId || 'pending'}`,
                      created: Math.floor(Date.now() / 1000),
                      model: params.model,
                      delta: { reasoning_content: chunk.reasoning },
                      finishReason: null,
                    }),
                  ),
                ),
              )
            } else if (chunk.type === 'final') {
              if (!assistantMessageId) {
                const [saved] = await db
                  .insert(chatMessage)
                  .values({
                    threadId: params.threadId,
                    userId: params.userId,
                    role: 'assistant',
                    content: combinedContent,
                    toolCalls: chunk.toolCalls
                      ? JSON.stringify(chunk.toolCalls)
                      : null,
                    regenerationCount: 0,
                    isDeleted: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  })
                  .returning({ id: chatMessage.id })
                assistantMessageId = saved.id
              } else {
                await db
                  .update(chatMessage)
                  .set({
                    content: combinedContent,
                    updatedAt: new Date(),
                  })
                  .where(eq(chatMessage.id, assistantMessageId))
              }

              allToolCalls = chunk.toolCalls || []
              finalUsage = chunk.usage || finalUsage

              if (
                chunk.finishReason === 'tool_calls' &&
                allToolCalls.length > 0
              ) {
                const toolResults = await executeToolCalls(allToolCalls)

                for (const result of toolResults) {
                  await db.insert(chatMessage).values({
                    threadId: params.threadId,
                    userId: params.userId,
                    role: 'tool',
                    content: result.error
                      ? `Error: ${result.error}`
                      : result.result,
                    toolCallId: result.toolCallId,
                    regenerationCount: 0,
                    isDeleted: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  })
                }

                const toolMessages: BaseMessage[] = toolResults.map(
                  (result) =>
                    new ToolMessage(
                      result.error ? `Error: ${result.error}` : result.result,
                      result.toolCallId,
                    ),
                )

                const aiMessage = new AIMessage(combinedContent)
                aiMessage.tool_calls = allToolCalls.map((tc) => ({
                  id: tc.id,
                  name: tc.function.name,
                  args: tc.function.arguments
                    ? JSON.parse(tc.function.arguments)
                    : {},
                  type: 'tool_call' as const,
                }))
                currentMessages = [
                  ...currentMessages,
                  aiMessage,
                  ...toolMessages,
                ]
                continue
              } else {
                if (finalUsage) {
                  controller.enqueue(
                    encoder.encode(
                      toSseEvent(
                        toOpenAiChunkWithUsage({
                          id: `chatcmpl-${assistantMessageId}`,
                          created: Math.floor(Date.now() / 1000),
                          model: params.model,
                          usage: finalUsage,
                          systemFingerprint: SYSTEM_FINGERPRINT,
                        }),
                      ),
                    ),
                  )
                }

                controller.enqueue(encoder.encode(toSseEvent('[DONE]')))
                break
              }
            }
          }

          if (allToolCalls.length === 0) break
          allToolCalls = []
        }

        // Refresh thread's latest message index
        if (assistantMessageId) {
          await refreshThreadLatestMessage(params.threadId)
        }

        controller.close()
      } catch (error) {
        console.error('[OpenAI Chat Stream] Error:', error)
        controller.error(error)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Thread-Id': params.threadId,
    },
  })
}
