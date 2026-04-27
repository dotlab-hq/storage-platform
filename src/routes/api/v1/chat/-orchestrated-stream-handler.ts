import { db } from '@/db'
import { chatMessage } from '@/db/schema/chat'
import type { BaseMessage } from '@langchain/core/messages'
import type { LLMStreamParams } from '@/routes/_app/chat/-chat-llm-streamer'
import {
  toOpenAiChunk,
  toOpenAiChunkWithUsage,
  toSseEvent,
} from '@/routes/_app/chat/-openai-helpers'
import { SYSTEM_FINGERPRINT } from '@/lib/token-counter'
import { refreshThreadLatestMessage } from '@/routes/_app/chat/-chat-server-db'
import { MemoryManager } from '@/lib/agent/memory-manager'
import { augmentMessagesWithMemory } from '@/lib/agent/memory-integration'
import { buildSupervisorGraph } from '@/lib/agent/orchestration/supervisor-graph'
import { webAgent } from '@/lib/agent/agents/web-agent'
import { storageAgent } from '@/lib/agent/agents/storage-agent'
import { generalAgent } from '@/lib/agent/agents/general-agent'
import { getFilteredTools } from '@/routes/_app/chat/tools/-tool-registry-scoped'
import { hasScope } from '@/lib/permissions/scopes'
import { normalizeOpenAiMessage } from '@/utils/normalize-openai-message'

export interface OrchestratedHandlerParams {
  messages: BaseMessage[]
  params: LLMStreamParams
  threadId: string
  userId: string
  userMessageId: string
  model: string
  permissions: string | null
}

export async function handleOrchestratedAgentStream(
  params: OrchestratedHandlerParams,
) {
  const encoder = new TextEncoder()

  const readable = new ReadableStream( {
    async start( controller ) {
      let assistantMessageId: string | null = null
      let fullContent = ''
      let emittedReasoning = ''

      try {
        const hasWebScope = hasScope( params.permissions, 'chat:tool:web' )
        const hasMemoryScope = hasScope( params.permissions, 'chat:memory' )
        const hasStorageScope = hasScope(
          params.permissions,
          'chat:tool:storage',
        )

        const allTools = getFilteredTools( params.permissions )
        const agentTools: Record<string, any[]> = {}

        agentTools[generalAgent.name] = generalAgent.getTools()

        if ( hasWebScope ) {
          agentTools[webAgent.name] = webAgent.getTools()
        }

        if ( hasStorageScope ) {
          agentTools[storageAgent.name] = storageAgent.getTools()
        }

        let augmentedMessages = params.messages
        if ( hasMemoryScope ) {
          augmentedMessages = await augmentMessagesWithMemory(
            params.messages,
            params.userId,
            params.threadId,
            true,
          )
        }

        const graph = buildSupervisorGraph( agentTools, allTools, {
          userId: params.userId,
          threadId: params.threadId,
        } )

        const initialState = {
          messages: augmentedMessages,
          next: null as string | null,
          iteration: 0,
        }

        let collectedContent = ''

        // Use streamMode: 'updates' to get node outputs as they complete
        // instead of full state snapshots (which buffer everything)
        const graphStream = await graph.stream( initialState, {
          streamMode: 'updates',
        } )

        let reasoningBuffer = ''
        let contentBuffer = ''

        for await ( const stepOutput of graphStream ) {
          // Each stepOutput is { nodeName: state } for the node that just completed
          for ( const [nodeName, state] of Object.entries( stepOutput ) ) {
            const nodeState = state as { messages?: BaseMessage[]; reasoning_content?: string; content?: string | unknown[] }
            const msgs = nodeState.messages as BaseMessage[]
            if ( !msgs || msgs.length === 0 ) continue

            const last = msgs[msgs.length - 1]
            if ( !last ) continue

            // Emit reasoning content immediately when available
            const reasoning = nodeState.reasoning_content
            if ( reasoning && reasoning !== reasoningBuffer ) {
              reasoningBuffer = reasoning
              controller.enqueue(
                encoder.encode(
                  toSseEvent(
                    toOpenAiChunk( {
                      id: `chatcmpl-${assistantMessageId || 'pending'}`,
                      created: Math.floor( Date.now() / 1000 ),
                      model: params.model,
                      delta: { reasoning_content: reasoning },
                      finishReason: null,
                    } ),
                  ),
                ),
              )
            }

            // Emit content delta
            const content = nodeState.content
            if ( content ) {
              const contentStr =
                typeof content === 'string'
                  ? content
                  : ( content as Array<{ type?: string; text?: string }> )
                    .map( ( part ) => part?.text || '' )
                    .join( '' )

              if ( contentStr.length > contentBuffer.length ) {
                const delta = contentStr.slice( contentBuffer.length )
                contentBuffer = contentStr

                controller.enqueue(
                  encoder.encode(
                    toSseEvent(
                      toOpenAiChunk( {
                        id: `chatcmpl-${assistantMessageId || 'pending'}`,
                        created: Math.floor( Date.now() / 1000 ),
                        model: params.model,
                        delta: { content: delta },
                        finishReason: null,
                      } ),
                    ),
                  ),
                )
              }
            }

            // Handle AI message type from messages array
            if ( last?._getType() === 'ai' ) {
              const normalized = normalizeOpenAiMessage( last )
              const reasoningText = normalized.reasoning_content ?? ''
              const aiContent =
                typeof normalized.content === 'string'
                  ? normalized.content
                  : ( normalized.content as Array<{ type?: string; text?: string }> )
                    .map( ( part ) => ( part.type === 'text' ? part.text : '' ) )
                    .join( '' )

              // Emit reasoning
              if ( reasoningText && reasoningText !== emittedReasoning ) {
                emittedReasoning = reasoningText
                controller.enqueue(
                  encoder.encode(
                    toSseEvent(
                      toOpenAiChunk( {
                        id: `chatcmpl-${assistantMessageId || 'pending'}`,
                        created: Math.floor( Date.now() / 1000 ),
                        model: params.model,
                        delta: { reasoning_content: reasoningText },
                        finishReason: null,
                      } ),
                    ),
                  ),
                )
              }

              // Emit content
              if ( aiContent.length > collectedContent.length ) {
                const delta = aiContent.slice( collectedContent.length )
                collectedContent = aiContent

                controller.enqueue(
                  encoder.encode(
                    toSseEvent(
                      toOpenAiChunk( {
                        id: `chatcmpl-${assistantMessageId || 'pending'}`,
                        created: Math.floor( Date.now() / 1000 ),
                        model: params.model,
                        delta: { content: delta },
                        finishReason: null,
                      } ),
                    ),
                  ),
                )

                // Handle tool calls
                const toolCalls = normalized.tool_calls
                if ( toolCalls?.length ) {
                  for ( const tc of toolCalls ) {
                    controller.enqueue(
                      encoder.encode(
                        toSseEvent(
                          toOpenAiChunk( {
                            id: `chatcmpl-${assistantMessageId || 'pending'}`,
                            created: Math.floor( Date.now() / 1000 ),
                            model: params.model,
                            delta: {
                              tool_calls: [
                                {
                                  index: 0,
                                  id: tc.id,
                                  type: 'function',
                                  function: {
                                    name: tc.function.name,
                                    arguments: tc.function.arguments,
                                  },
                                },
                              ],
                            },
                            finishReason: null,
                          } ),
                        ),
                      ),
                    )
                  }
                }
              }
            }

            // Handle tool result messages
            if ( last?._getType() === 'tool' ) {
              const toolMsg = last as {
                content?: unknown
                tool_call_id?: string
              }
              const normalizedTool = normalizeOpenAiMessage( toolMsg )
              const toolContent =
                typeof normalizedTool.content === 'string'
                  ? normalizedTool.content
                  : ( normalizedTool.content as Array<{ type?: string; text?: string }> )
                    .map( ( part ) => ( part.type === 'text' ? part.text : '' ) )
                    .join( '' )

              await db.insert( chatMessage ).values( {
                threadId: params.threadId,
                userId: params.userId,
                role: 'tool',
                content: toolContent,
                toolCallId: toolMsg.tool_call_id,
                regenerationCount: 0,
                isDeleted: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              } )

              controller.enqueue(
                encoder.encode(
                  toSseEvent(
                    toOpenAiChunk( {
                      id: `chatcmpl-${assistantMessageId || 'pending'}`,
                      created: Math.floor( Date.now() / 1000 ),
                      model: params.model,
                      delta: {
                        content: `\n[Tool Result] ${toolContent}`,
                      },
                      finishReason: null,
                    } ),
                  ),
                ),
              )
            }
          }
        }

        fullContent = collectedContent

        const [saved] = await db
          .insert( chatMessage )
          .values( {
            threadId: params.threadId,
            userId: params.userId,
            role: 'assistant',
            content: fullContent,
            toolCalls: null,
            regenerationCount: 0,
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          } )
          .returning( { id: chatMessage.id } )

        assistantMessageId = saved.id

        if ( hasMemoryScope ) {
          await MemoryManager.addFact(
            params.userId,
            params.threadId,
            `Interaction: ${fullContent.slice( 0, 200 )}`,
          )
        }

        const usage = {
          prompt_tokens: Math.floor( params.messages.length * 150 ),
          completion_tokens: Math.floor( fullContent.length / 4 ),
          total_tokens:
            Math.floor( fullContent.length / 4 ) + params.messages.length * 150,
        }

        controller.enqueue(
          encoder.encode(
            toSseEvent(
              toOpenAiChunkWithUsage( {
                id: `chatcmpl-${assistantMessageId}`,
                created: Math.floor( Date.now() / 1000 ),
                model: params.model,
                usage,
                systemFingerprint: SYSTEM_FINGERPRINT,
              } ),
            ),
          ),
        )

        controller.enqueue( encoder.encode( toSseEvent( '[DONE]' ) ) )
      } catch ( error ) {
        console.error( '[OrchestratedAgent]', error )

        controller.enqueue(
          encoder.encode(
            toSseEvent(
              toOpenAiChunk( {
                id: 'chatcmpl-error',
                created: Math.floor( Date.now() / 1000 ),
                model: params.model,
                delta: { content: `\n[Error] ${error}` },
                finishReason: null,
              } ),
            ),
          ),
        )

        controller.enqueue( encoder.encode( toSseEvent( '[DONE]' ) ) )
      } finally {
        if ( assistantMessageId ) {
          try {
            await refreshThreadLatestMessage( params.threadId )
          } catch { }
        }
        controller.close()
      }
    },
  } )

  return new Response( readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Thread-Id': params.threadId,
    },
  } )
}
