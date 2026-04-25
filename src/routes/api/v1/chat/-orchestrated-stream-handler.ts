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
import { MemoryManager } from '@/lib/agent/memory-manager'
import { augmentMessagesWithMemory } from '@/lib/agent/memory-integration'
import { buildSupervisorGraph } from '@/lib/agent/orchestration/supervisor-graph'
import { webAgent } from '@/lib/agent/agents/web-agent'
import { storageAgent } from '@/lib/agent/agents/storage-agent'
import { generalAgent } from '@/lib/agent/agents/general-agent'
import { getFilteredTools } from '@/routes/_app/chat/tools/tool-registry-scoped'
import { hasScope } from '@/lib/permissions/scopes'

export interface OrchestratedHandlerParams {
  messages: BaseMessage[]
  params: LLMStreamParams
  threadId: string
  userId: string
  userMessageId: string
  model: string
  permissions: string | null
}

/**
 * Orchestrated streaming with supervisor + memory + scoped tools
 */
export async function handleOrchestratedAgentStream(
  params: OrchestratedHandlerParams,
) {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      let assistantMessageId: string | null = null
      let fullContent = ''

      try {
        // Scope checks
        const hasWebScope = hasScope(params.permissions, 'chat:tool:web')
        const hasMemoryScope = hasScope(params.permissions, 'chat:memory')

        // Build agents configuration
        const allTools = getFilteredTools(params.permissions)
        const agentTools: Record<string, any[]> = {}

        // Always include general agent
        agentTools[generalAgent.name] = generalAgent.getTools()

        // Add web agent if scoped
        if (hasWebScope) {
          agentTools[webAgent.name] = webAgent.getTools()
        }

        // Add storage agent if scoped
        const hasStorageScope = hasScope(
          params.permissions,
          'chat:tool:storage',
        )
        if (hasStorageScope) {
          agentTools[storageAgent.name] = storageAgent.getTools()
        }

        // Augment with memory
        let augmentedMessages = params.messages
        if (hasMemoryScope) {
          augmentedMessages = await augmentMessagesWithMemory(
            params.messages,
            params.userId,
            params.threadId,
            true,
          )
        }

        // Build graph with user context for tool hooks
        const graph = buildSupervisorGraph(agentTools, allTools, {
          userId: params.userId,
          threadId: params.threadId,
        })

        const initialState = {
          messages: augmentedMessages,
          next: null as string | null,
          iteration: 0,
        }

        let collectedContent = ''

        const stream = await graph.stream(initialState, {
          streamMode: 'values',
        })

        for await (const state of stream) {
          const msgs = state.messages as BaseMessage[]
          const last = msgs[msgs.length - 1]

          // Agent transition event
          if (state.next && state.next !== last?._getType()) {
            controller.enqueue(
              encoder.encode(
                toSseEvent(
                  toOpenAiChunk({
                    id: `chatcmpl-${assistantMessageId || 'pending'}`,
                    created: Math.floor(Date.now() / 1000),
                    model: params.model,
                    delta: {
                      reasoning_content: `[Agent: ${state.next}] `,
                    },
                    finishReason: null,
                  }),
                ),
              ),
            )
          }

          // Stream AI content
          if (last?._getType() === 'ai') {
            const content = (last as any).content || ''
            if (content.length > collectedContent.length) {
              const delta = content.slice(collectedContent.length)
              collectedContent = content

              controller.enqueue(
                encoder.encode(
                  toSseEvent(
                    toOpenAiChunk({
                      id: `chatcmpl-${assistantMessageId || 'pending'}`,
                      created: Math.floor(Date.now() / 1000),
                      model: params.model,
                      delta: { content: delta },
                      finishReason: null,
                    }),
                  ),
                ),
              )

              // Stream tool calls if present
              const toolCalls = (last as any).tool_calls
              if (toolCalls?.length) {
                for (const tc of toolCalls) {
                  controller.enqueue(
                    encoder.encode(
                      toSseEvent(
                        toOpenAiChunk({
                          id: `chatcmpl-${assistantMessageId || 'pending'}`,
                          created: Math.floor(Date.now() / 1000),
                          model: params.model,
                          delta: {
                            tool_calls: [
                              {
                                index: 0,
                                id: tc.id,
                                type: 'function',
                                function: {
                                  name: tc.name,
                                  arguments: JSON.stringify(tc.args || {}),
                                },
                              },
                            ],
                          },
                          finishReason: null,
                        }),
                      ),
                    ),
                  )
                }
              }
            }
          }

          // Stream tool results
          if (last?._getType() === 'tool') {
            const toolMsg = last as any
            const toolCallId = toolMsg.tool_call_id
            const content = toolMsg.content || ''

            // Persist tool message to DB
            await db.insert(chatMessage).values({
              threadId: params.threadId,
              userId: params.userId,
              role: 'tool',
              content,
              toolCallId,
              regenerationCount: 0,
              isDeleted: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            })

            controller.enqueue(
              encoder.encode(
                toSseEvent(
                  toOpenAiChunk({
                    id: `chatcmpl-${assistantMessageId || 'pending'}`,
                    created: Math.floor(Date.now() / 1000),
                    model: params.model,
                    delta: { content: `\n[Tool Result] ${content}` },
                    finishReason: null,
                  }),
                ),
              ),
            )
          }
        }

        // Save final message
        fullContent = collectedContent
        const [saved] = await db
          .insert(chatMessage)
          .values({
            threadId: params.threadId,
            userId: params.userId,
            role: 'assistant',
            content: fullContent,
            toolCalls: null,
            regenerationCount: 0,
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning({ id: chatMessage.id })
        assistantMessageId = saved.id

        // Memory
        if (hasMemoryScope) {
          await MemoryManager.addFact(
            params.userId,
            params.threadId,
            `Interaction: ${fullContent.slice(0, 200)}`,
          )
        }

        // Usage
        const usage = {
          prompt_tokens: Math.floor(params.messages.length * 150),
          completion_tokens: Math.floor(fullContent.length / 4),
          total_tokens:
            Math.floor(fullContent.length / 4) + params.messages.length * 150,
        }

        controller.enqueue(
          encoder.encode(
            toSseEvent(
              toOpenAiChunkWithUsage({
                id: `chatcmpl-${assistantMessageId}`,
                created: Math.floor(Date.now() / 1000),
                model: params.model,
                usage,
                systemFingerprint: SYSTEM_FINGERPRINT,
              }),
            ),
          ),
        )

        controller.enqueue(encoder.encode(toSseEvent('[DONE]')))
      } catch (error) {
        console.error('[OrchestratedAgent]', error)
        controller.enqueue(
          encoder.encode(
            toSseEvent(
              toOpenAiChunk({
                id: 'chatcmpl-error',
                created: Math.floor(Date.now() / 1000),
                model: params.model,
                delta: { content: `\n[Error] ${error}` },
                finishReason: null,
              }),
            ),
          ),
        )
        controller.enqueue(encoder.encode(toSseEvent('[DONE]')))
      } finally {
        if (assistantMessageId) {
          try {
            await refreshThreadLatestMessage(params.threadId)
          } catch {
            // ignore
          }
        }
        controller.close()
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

/**
 * Orchestrated streaming with supervisor + memory + scoped tools
 */
export async function handleOrchestratedAgentStream(
  params: OrchestratedHandlerParams,
) {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      let assistantMessageId: string | null = null
      let fullContent = ''

      try {
        // Scope checks
        const hasWebScope = hasScope(params.permissions, 'chat:tool:web')
        const hasMemoryScope = hasScope(params.permissions, 'chat:memory')

        // Build agents configuration with their tools
        const allTools = getFilteredTools(params.permissions)
        const agentTools: Record<string, any[]> = {}

        // Always include general agent
        agentTools[generalAgent.name] = generalAgent.getTools()

        // Add web agent if scoped
        if (hasWebScope) {
          agentTools[webAgent.name] = webAgent.getTools()
        }

        // Augment with memory
        let augmentedMessages = params.messages
        if (hasMemoryScope) {
          augmentedMessages = await augmentMessagesWithMemory(
            params.messages,
            params.userId,
            params.threadId,
            true,
          )
        }

        // Build and run the graph
        const graph = buildSupervisorGraph(agentTools, allTools)

        const initialState = {
          messages: augmentedMessages,
          next: null as string | null,
          iteration: 0,
        }

        let collectedContent = ''

        const stream = await graph.stream(initialState, {
          streamMode: 'values',
        })

        for await (const state of stream) {
          const msgs = state.messages as BaseMessage[]
          const last = msgs[msgs.length - 1]

          // Agent transition
          if (state.next && state.next !== last?._getType()) {
            controller.enqueue(
              encoder.encode(
                toSseEvent(
                  toOpenAiChunk({
                    id: `chatcmpl-${assistantMessageId || 'pending'}`,
                    created: Math.floor(Date.now() / 1000),
                    model: params.model,
                    delta: {
                      reasoning_content: `[Agent: ${state.next}] `,
                    },
                    finishReason: null,
                  }),
                ),
              ),
            )
          }

          // Stream AI content
          if (last?._getType() === 'ai') {
            const content = (last as any).content || ''
            if (content.length > collectedContent.length) {
              const delta = content.slice(collectedContent.length)
              collectedContent = content

              // Stream token chunk
              controller.enqueue(
                encoder.encode(
                  toSseEvent(
                    toOpenAiChunk({
                      id: `chatcmpl-${assistantMessageId || 'pending'}`,
                      created: Math.floor(Date.now() / 1000),
                      model: params.model,
                      delta: { content: delta },
                      finishReason: null,
                    }),
                  ),
                ),
              )

              // Stream tool calls
              const toolCalls = (last as any).tool_calls
              if (toolCalls?.length) {
                for (const tc of toolCalls) {
                  controller.enqueue(
                    encoder.encode(
                      toSseEvent(
                        toOpenAiChunk({
                          id: `chatcmpl-${assistantMessageId || 'pending'}`,
                          created: Math.floor(Date.now() / 1000),
                          model: params.model,
                          delta: {
                            tool_calls: [
                              {
                                index: 0,
                                id: tc.id,
                                type: 'function',
                                function: {
                                  name: tc.name,
                                  arguments: JSON.stringify(tc.args || {}),
                                },
                              },
                            ],
                          },
                          finishReason: null,
                        }),
                      ),
                    ),
                  )
                }
              }
            }
          }

          // Stream tool results
          if (last?._getType() === 'tool') {
            const toolCallId = (last as any).tool_call_id
            const content = (last as any).content

            controller.enqueue(
              encoder.encode(
                toSseEvent(
                  toOpenAiChunk({
                    id: `chatcmpl-${assistantMessageId || 'pending'}`,
                    created: Math.floor(Date.now() / 1000),
                    model: params.model,
                    delta: {
                      content: `\n[Tool Result] ${content}`,
                    },
                    finishReason: null,
                  }),
                ),
              ),
            )
          }
        }

        // Save final message
        fullContent = collectedContent
        const [saved] = await db
          .insert(chatMessage)
          .values({
            threadId: params.threadId,
            userId: params.userId,
            role: 'assistant',
            content: fullContent,
            toolCalls: null,
            regenerationCount: 0,
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning({ id: chatMessage.id })
        assistantMessageId = saved.id

        // Save memory
        if (hasMemoryScope) {
          const userMsg = params.messages[params.messages.length - 1]
          // Memory extraction (simplified)
          await MemoryManager.addFact(
            params.userId,
            params.threadId,
            `Interaction at ${new Date().toISOString()}`,
          )
        }

        // Usage
        const usage = {
          prompt_tokens: Math.floor(params.messages.length * 150),
          completion_tokens: Math.floor(fullContent.length / 4),
          total_tokens:
            Math.floor(fullContent.length / 4) + params.messages.length * 150,
        }

        controller.enqueue(
          encoder.encode(
            toSseEvent(
              toOpenAiChunkWithUsage({
                id: `chatcmpl-${assistantMessageId}`,
                created: Math.floor(Date.now() / 1000),
                model: params.model,
                usage,
                systemFingerprint: SYSTEM_FINGERPRINT,
              }),
            ),
          ),
        )

        controller.enqueue(encoder.encode(toSseEvent('[DONE]')))
      } catch (error) {
        console.error('[OrchestratedAgent]', error)
        controller.enqueue(
          encoder.encode(
            toSseEvent(
              toOpenAiChunk({
                id: 'chatcmpl-error',
                created: Math.floor(Date.now() / 1000),
                model: params.model,
                delta: { content: `\n[Error] ${error}` },
                finishReason: null,
              }),
            ),
          ),
        )
        controller.enqueue(encoder.encode(toSseEvent('[DONE]')))
      } finally {
        if (assistantMessageId) {
          try {
            await refreshThreadLatestMessage(params.threadId)
          } catch {
            // ignore
          }
        }
        controller.close()
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
