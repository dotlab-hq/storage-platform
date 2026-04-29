import { db } from '@/db'
import { chatMessage } from '@/db/schema/chat'
import { eq } from 'drizzle-orm'
import type { BaseMessage } from '@langchain/core/messages'
import type { LLMStreamParams } from '@/routes/_app/chat/-chat-llm-streamer'
import {
  toOpenAiChunk,
  toOpenAiChunkWithUsage,
  toSseEvent,
} from '@/routes/_app/chat/-openai-helpers'
import type { Usage } from '@/lib/token-counter'
import { SYSTEM_FINGERPRINT } from '@/lib/token-counter'
import { refreshThreadLatestMessage } from '@/routes/_app/chat/-chat-server-db'
import { runDeepAgent } from '@/lib/agent/deep-agent.graph'
import { mathTools } from '@/routes/_app/chat/tools/-tool-registry'

export interface StreamingHandlerParams {
  messages: BaseMessage[]
  params: LLMStreamParams
  threadId: string
  userId: string
  userMessageId: string
  model: string
  useDeepAgent?: boolean // Toggle between simple and deep agent
}

/**
 * Enhanced streaming handler with LangGraph-based DeepAgent
 *
 * Implements start -> deepagent -> end flow with full step visibility
 * and proper error propagation showing root causes.
 */
export async function handleDeepAgentStream(params: StreamingHandlerParams) {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      let assistantMessageId: string | null = null
      let fullContent = ''
      let finalUsage: Usage | null = null
      let iteration = 0

      try {
        // Build tools list from params
        const tools =
          params.params.tools && params.params.tools.length > 0
            ? params.params.tools
            : mathTools

        // Stream from DeepAgent graph with user context
        for await (const chunk of runDeepAgent(
          params.messages,
          tools,
          undefined,
          params.userId,
          params.threadId,
        )) {
          iteration++

          if (chunk.type === 'error') {
            // Capture and log detailed error
            const errorMessage = `[${chunk.error?.node || 'unknown'}] ${chunk.error?.message}`
            console.error(
              '[DeepAgent Stream] Error:',
              errorMessage,
              chunk.error?.stack,
            )

            // Send error as SSE event with full details
            controller.enqueue(
              encoder.encode(
                toSseEvent(
                  toOpenAiChunk({
                    id: `chatcmpl-${assistantMessageId || 'pending'}`,
                    created: Math.floor(Date.now() / 1000),
                    model: params.model,
                    delta: { content: `\n\n[Error: ${errorMessage}]` },
                    finishReason: null,
                  }),
                ),
              ),
            )

            // Save error to assistant message
            if (!assistantMessageId) {
              const [saved] = await db
                .insert(chatMessage)
                .values({
                  threadId: params.threadId,
                  userId: params.userId,
                  role: 'assistant',
                  content: `Error: ${errorMessage}`,
                  toolCalls: null,
                  regenerationCount: 0,
                  isDeleted: false,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                })
                .returning({ id: chatMessage.id })
              assistantMessageId = saved.id
            }

            controller.enqueue(encoder.encode(toSseEvent('[DONE]')))
            break
          }

          // Stream reasoning as it happens
          if (chunk.type === 'reasoning' && chunk.reasoning) {
            // Emit reasoning as a special content chunk
            // Using reasoning_content field per OpenAI spec extension
            fullContent += chunk.reasoning
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
          }

          // Stream tool calls when decided
          if (chunk.type === 'tool_call' && chunk.toolCall) {
            // Store tool call for DB insertion
            // This will be part of the final assistant message
          }

          // Stream tool results when they complete
          if (chunk.type === 'tool_result' && chunk.toolResult) {
            // Insert tool result message into DB
            await db.insert(chatMessage).values({
              threadId: params.threadId,
              userId: params.userId,
              role: 'tool',
              content: chunk.toolResult.error
                ? `Error: ${chunk.toolResult.error}`
                : String(chunk.toolResult.result || ''),
              toolCallId: chunk.toolResult.toolCallId,
              regenerationCount: 0,
              isDeleted: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            })

            // Stream tool result to client for immediate display
            controller.enqueue(
              encoder.encode(
                toSseEvent(
                  toOpenAiChunk({
                    id: `chatcmpl-${assistantMessageId || 'pending'}`,
                    created: Math.floor(Date.now() / 1000),
                    model: params.model,
                    delta: {
                      content: `\n\n[Tool: ${chunk.toolResult.toolName}]\n${chunk.toolResult.error ? '❌ ' + chunk.toolResult.error : chunk.toolResult.result}`,
                    },
                    finishReason: null,
                  }),
                ),
              ),
            )
          }

          // Final completion
          if (chunk.type === 'final' && chunk.done) {
            // Save assistant message to DB if not already saved
            if (!assistantMessageId) {
              const [saved] = await db
                .insert(chatMessage)
                .values({
                  threadId: params.threadId,
                  userId: params.userId,
                  role: 'assistant',
                  content: chunk.message || fullContent,
                  toolCalls: null, // Could serialize tool calls if needed
                  regenerationCount: 0,
                  isDeleted: false,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                })
                .returning({ id: chatMessage.id })
              assistantMessageId = saved.id
            } else {
              // Update existing message
              await db
                .update(chatMessage)
                .set({
                  content: chunk.message || fullContent,
                  updatedAt: new Date(),
                })
                .where(eq(chatMessage.id, assistantMessageId))
            }

            // Compute usage
            finalUsage = {
              prompt_tokens: Math.floor(fullContent.length / 4),
              completion_tokens: Math.floor(fullContent.length / 4),
              total_tokens: Math.floor(fullContent.length / 2),
            }

            // Send final usage chunk
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

          // Step transitions provide metadata but no content
          if (chunk.type === 'step_complete' && chunk.step) {
            // Could emit a control event if needed
            console.log(
              `[DeepAgent] Step: ${chunk.step}, Iteration: ${chunk.iteration}`,
            )
          }
        }
      } catch (error) {
        // Catch any unhandled errors and show full details
        const err = error instanceof Error ? error : new Error(String(error))
        console.error('[DeepAgent Stream] Uncaught error:', err)

        const errorMessage = `${err.name}: ${err.message}\nStack: ${err.stack || 'No stack trace available'}`

        controller.enqueue(
          encoder.encode(
            toSseEvent(
              toOpenAiChunk({
                id: `chatcmpl-error`,
                created: Math.floor(Date.now() / 1000),
                model: params.model,
                delta: { content: `\n\n[Critical Error]\n${errorMessage}` },
                finishReason: null,
              }),
            ),
          ),
        )

        // Save critical error to DB
        if (!assistantMessageId) {
          try {
            const [saved] = await db
              .insert(chatMessage)
              .values({
                threadId: params.threadId,
                userId: params.userId,
                role: 'assistant',
                content: `Critical Error: ${errorMessage}`,
                toolCalls: null,
                regenerationCount: 0,
                isDeleted: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              })
              .returning({ id: chatMessage.id })
            assistantMessageId = saved.id
          } catch (dbErr) {
            console.error('[DeepAgent] Failed to save error message:', dbErr)
          }
        }

        controller.enqueue(encoder.encode(toSseEvent('[DONE]')))
      } finally {
        // Refresh thread's latest message index
        if (assistantMessageId) {
          try {
            await refreshThreadLatestMessage(params.threadId)
          } catch (err) {
            console.error('[DeepAgent] Failed to refresh thread:', err)
          }
        }
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Thread-Id': params.threadId,
    },
  })
}
