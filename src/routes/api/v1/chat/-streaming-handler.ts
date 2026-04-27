import { db } from '@/db'
import { chatMessage } from '@/db/schema/chat'
import { eq } from 'drizzle-orm'
import type { BaseMessage } from '@langchain/core/messages'
import { AIMessage, ToolMessage } from '@langchain/core/messages'
import { getTool, getAllTools } from '@/routes/_app/chat/tools/-tool-registry'
import {
  toOpenAiChunk,
  toOpenAiChunkWithUsage,
  toSseEvent,
} from '@/routes/_app/chat/-openai-helpers'
import { SYSTEM_FINGERPRINT } from '@/lib/token-counter'
import type { Usage } from '@/lib/token-counter'
import { refreshThreadLatestMessage } from '@/routes/_app/chat/-chat-server-db'
import type { LLMStreamParams } from '@/routes/_app/chat/-chat-llm-streamer'
import type { OpenAiToolCall } from '@/routes/api/v1/-schemas'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('0123456789abcdef', 21)

function generateInvocationId(): string {
  return `call_${nanoid()}`
}

export interface StreamingHandlerParams {
  messages: BaseMessage[]
  params: LLMStreamParams
  threadId: string
  userId: string
  userMessageId: string
  model: string
}

/**
 * Parse tool arguments from JSON string safely
 */
function parseToolArguments(argStr: string): Record<string, unknown> {
  try {
    return JSON.parse(argStr)
  } catch {
    return { raw: argStr }
  }
}

/**
 * Enhanced streaming handler with tool orchestration
 * Replaces simple executeToolCalls with ToolOrchestrator
 */
export async function handleStreamingResponse(params: StreamingHandlerParams) {
  const encoder = new TextEncoder()

  // ToolOrchestrator creation
  const { ToolOrchestrator, createDefaultOrchestrator } =
    await import('@/routes/_app/chat/tools/-tool-orchestrator')
  const orchestrator = createDefaultOrchestrator()

  // Register enhanced tools
  const allTools = getAllTools()
  for (const tool of allTools) {
    // Try to import enhanced metadata (lazy to avoid circular)
    try {
      const { enhanceToolWithHeuristics } =
        await import('@/routes/_app/chat/tools/-base-enhanced-tool')
      const enhanced = enhanceToolWithHeuristics(tool)
      orchestrator.register(enhanced)
    } catch {
      // Fallback: basic metadata
      orchestrator.register({
        name: tool.name,
        description: tool.description,
        schema: (tool as any).schema,
        tool,
        capabilities: {
          concurrencySafe: true,
          readOnly: false,
          interruptible: true,
          requiresNetwork: false,
          longRunning: false,
        },
        executionContext: 'server',
      } as any)
    }
  }

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
        let roleChunkSent = false

        try {
          while (iteration < MAX_ITERATIONS) {
            iteration++

            const { generateAssistantReplyStream } =
              await import('@/routes/_app/chat/-chat-llm-streamer')

            for await (const chunk of generateAssistantReplyStream(
              currentMessages,
              params.params,
            )) {
              // [Send SSE chunks as before - lines 53-138]
              if (!roleChunkSent) {
                roleChunkSent = true
                controller.enqueue(
                  encoder.encode(
                    toSseEvent(
                      toOpenAiChunk({
                        id: `chatcmpl-${assistantMessageId || 'pending'}`,
                        created: Math.floor(Date.now() / 1000),
                        model: params.model,
                        delta: { role: 'assistant' },
                        finishReason: null,
                      }),
                    ),
                  ),
                )
              }

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
              } else if (chunk.type === 'error' && chunk.error) {
                const errorMessage = chunk.error
                console.error('[LLM] Error chunk received:', errorMessage)

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
                  const toolCallCreated = Math.floor(Date.now() / 1000)

                  allToolCalls.forEach((toolCall, index) => {
                    controller.enqueue(
                      encoder.encode(
                        toSseEvent(
                          toOpenAiChunk({
                            id: `chatcmpl-${assistantMessageId || 'pending'}`,
                            created: toolCallCreated,
                            model: params.model,
                            delta: {
                              tool_calls: [
                                {
                                  index,
                                  id: toolCall.id,
                                  type: 'function',
                                  function: {
                                    name: toolCall.function.name,
                                    arguments: toolCall.function.arguments,
                                  },
                                },
                              ],
                            },
                            finishReason: null,
                          }),
                        ),
                      ),
                    )
                  })

                  // ORCHESTRATOR EXECUTION
                  const internalToolCalls = allToolCalls.filter(
                    (toolCall) => getTool(toolCall.function.name) !== undefined,
                  )
                  const externalToolCalls = allToolCalls.filter(
                    (toolCall) => getTool(toolCall.function.name) === undefined,
                  )

                  if (externalToolCalls.length > 0) {
                    // Unrecognized tool - send finish and exit
                    if (finalUsage) {
                      controller.enqueue(
                        encoder.encode(
                          toSseEvent(
                            toOpenAiChunkWithUsage({
                              id: completionId,
                              created: Math.floor(Date.now() / 1000),
                              model: params.model,
                              usage: finalUsage,
                              systemFingerprint: SYSTEM_FINGERPRINT,
                              finishReason: 'tool_calls',
                            }),
                          ),
                        ),
                      )
                    } else {
                      controller.enqueue(
                        encoder.encode(
                          toSseEvent(
                            toOpenAiChunk({
                              id: completionId,
                              created: Math.floor(Date.now() / 1000),
                              model: params.model,
                              delta: {},
                              finishReason: 'tool_calls',
                            }),
                          ),
                        ),
                      )
                    }

                    controller.enqueue(encoder.encode(toSseEvent('[DONE]')))
                    allToolCalls = []
                    iteration = MAX_ITERATIONS
                    break
                  }

                  // ORCHESTRATED tool execution
                  const toolResults: Array<{
                    toolCallId: string
                    result: string
                    error?: string
                  }> = []

                  if (internalToolCalls.length > 0) {
                    // Build context for this iteration
                    const context: ToolExecutionContext = {
                      invocationId: generateInvocationId(),
                      userId: params.userId,
                      threadId: params.threadId,
                      startedAt: new Date(),
                      metadata: { iteration, phase: 'tool_execution' },
                    }

                    const executions = await orchestrator.execute(
                      internalToolCalls,
                      {
                        onProgress: (progress) => {
                          // Optional: stream progress updates to client
                          controller.enqueue(
                            encoder.encode(
                              toSseEvent({
                                type: 'tool_progress',
                                tool_name: progress.message.split(' ')[0] || '',
                                elapsed_time_seconds: 0,
                                progress,
                              } as any),
                            ),
                          )
                        },
                      },
                    )

                    // Save results & build messages
                    for (const resp of executions) {
                      const { result } = resp
                      await db.insert(chatMessage).values({
                        threadId: params.threadId,
                        userId: params.userId,
                        role: 'tool',
                        content: result.success
                          ? String(result.data ?? 'OK')
                          : `Error: ${result.error}`,
                        toolCallId: resp.invocationId,
                        regenerationCount: 0,
                        isDeleted: false,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                      })

                      toolResults.push({
                        toolCallId: resp.invocationId,
                        result: result.success
                          ? String(result.data ?? 'OK')
                          : '',
                        error: result.success ? undefined : result.error,
                      })
                    }
                  }

                  // Create tool messages to send back to LLM
                  const toolMessages: BaseMessage[] = toolResults.map(
                    (r) =>
                      new ToolMessage(
                        r.error ? `Error: ${r.error}` : r.result,
                        r.toolCallId,
                      ),
                  )

                  // Update conversation state
                  const aiMessage = new AIMessage(combinedContent)
                  aiMessage.tool_calls = allToolCalls.map((tc) => ({
                    id: tc.id,
                    name: tc.function.name,
                    args: parseToolArguments(tc.function.arguments),
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
        } catch (streamError) {
          // [Same error handling as before]
          const err =
            streamError instanceof Error
              ? streamError
              : new Error(String(streamError))
          console.error('[OpenAI Chat Stream] Error:', {
            name: err.name,
            message: err.message,
            stack: err.stack,
            cause: err.cause,
          })

          const errorMessage = `Error: ${err.message}`
          controller.enqueue(
            encoder.encode(
              toSseEvent(
                toOpenAiChunk({
                  id: `chatcmpl-error`,
                  created: Math.floor(Date.now() / 1000),
                  model: params.model,
                  delta: { content: `\n\n[${errorMessage}]` },
                  finishReason: null,
                }),
              ),
            ),
          )

          if (!assistantMessageId) {
            try {
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
            } catch (dbErr) {
              console.error('[DB] Failed to save error:', dbErr)
            }
          }

          controller.enqueue(encoder.encode(toSseEvent('[DONE]')))
        } finally {
          if (assistantMessageId) {
            try {
              await db
                .update(chatMessage)
                .set({
                  content: combinedContent,
                  updatedAt: new Date(),
                })
                .where(eq(chatMessage.id, assistantMessageId))
              await refreshThreadLatestMessage(params.threadId)
            } catch (dbErr) {
              console.error('[DB] Final persist failed:', dbErr)
            }
          }
        }

        controller.close()
      } catch (error) {
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
    },
  })
}
