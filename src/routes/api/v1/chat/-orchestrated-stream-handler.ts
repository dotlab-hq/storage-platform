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

export async function handleOrchestratedAgentStream(
    params: OrchestratedHandlerParams,
) {
    const encoder = new TextEncoder()

    const readable = new ReadableStream( {
        async start( controller ) {
            let assistantMessageId: string | null = null
            let fullContent = ''

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

                const graphStream = await graph.stream( initialState, {
                    streamMode: 'values',
                } )

                for await ( const state of graphStream ) {
                    const msgs = state.messages as BaseMessage[]
                    const last = msgs[msgs.length - 1]

                    // Agent transition
                    if ( state.next && state.next !== last?._getType() ) {
                        controller.enqueue(
                            encoder.encode(
                                toSseEvent(
                                    toOpenAiChunk( {
                                        id: `chatcmpl-${assistantMessageId || 'pending'}`,
                                        created: Math.floor( Date.now() / 1000 ),
                                        model: params.model,
                                        delta: {
                                            reasoning_content: `[Agent: ${state.next}] `,
                                        },
                                        finishReason: null,
                                    } ),
                                ),
                            ),
                        )
                    }

                    // AI streaming
                    if ( last?._getType() === 'ai' ) {
                        const content = ( last as any ).content || ''

                        if ( content.length > collectedContent.length ) {
                            const delta = content.slice( collectedContent.length )
                            collectedContent = content

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

                            const toolCalls = ( last as any ).tool_calls
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
                                                                    name: tc.name,
                                                                    arguments: JSON.stringify( tc.args || {} ),
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

                    // Tool result
                    if ( last?._getType() === 'tool' ) {
                        const toolMsg = last as any

                        await db.insert( chatMessage ).values( {
                            threadId: params.threadId,
                            userId: params.userId,
                            role: 'tool',
                            content: toolMsg.content || '',
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
                                            content: `\n[Tool Result] ${toolMsg.content}`,
                                        },
                                        finishReason: null,
                                    } ),
                                ),
                            ),
                        )
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
                        Math.floor( fullContent.length / 4 ) +
                        params.messages.length * 150,
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