import { json } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { chatMessage, chatThread } from '@/db/schema/chat'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { generateAssistantReplyStream } from '../../_app/chat/-chat-assistant-reply-stream'
import { deriveThreadTitle } from '../../_app/chat/-chat-server-utils'
import { findOwnedThread, refreshThreadLatestMessage } from '../../_app/chat/-chat-server-db'
import {
    normalizeChatStreamRequest,
    toOpenAiChunk,
    toOpenAiCompletion,
    toSseEvent,
} from './-openai-chat-compat'

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute( '/api/chat/stream' )( {
    server: {
        handlers: {
            POST: POST,
        }
    }
} )

async function persistAssistantContent( {
    messageId,
    threadId,
    content,
}: {
    messageId: string
    threadId: string
    content: string
} ): Promise<void> {
    await db
        .update( chatMessage )
        .set( {
            content,
            updatedAt: new Date(),
        } )
        .where( eq( chatMessage.id, messageId ) )

    await refreshThreadLatestMessage( threadId )
}

function withCompatHeaders( threadId: string, assistantId: string, userId: string ) {
    return {
        'X-Thread-Id': threadId,
        'X-Assistant-Message-Id': assistantId,
        'X-User-Message-Id': userId,
        'Access-Control-Expose-Headers': 'X-Thread-Id, X-Assistant-Message-Id, X-User-Message-Id',
    }
}


export async function POST( { request }: { request: Request } ) {
    try {
        const body = await request.json()
        const normalized = normalizeChatStreamRequest( body )
        const { threadId, content, model, stream: shouldStream } = normalized

        const currentUser = await getAuthenticatedUser()

        // Get or create thread
        let thread = threadId
            ? await findOwnedThread( currentUser.id, threadId )
            : null

        if ( threadId && !thread ) {
            throw new Error( 'Thread not found.' )
        }

        const now = new Date()

        // Create thread if needed
        if ( !thread ) {
            const [created] = await db
                .insert( chatThread )
                .values( {
                    userId: currentUser.id,
                    title: deriveThreadTitle( content ),
                    latestPreview: null,
                    lastMessageAt: now,
                    createdAt: now,
                    updatedAt: now,
                } )
                .returning( {
                    id: chatThread.id,
                    title: chatThread.title,
                    latestPreview: chatThread.latestPreview,
                    lastMessageAt: chatThread.lastMessageAt,
                    createdAt: chatThread.createdAt,
                    updatedAt: chatThread.updatedAt,
                } )

            thread = created
        }

        // Insert user message
        const [userMessage] = await db
            .insert( chatMessage )
            .values( {
                threadId: thread.id,
                userId: currentUser.id,
                role: 'user',
                content,
                regenerationCount: 0,
                createdAt: now,
                updatedAt: now,
            } )
            .returning( {
                id: chatMessage.id,
                threadId: chatMessage.threadId,
                role: chatMessage.role,
                content: chatMessage.content,
                regenerationCount: chatMessage.regenerationCount,
                createdAt: chatMessage.createdAt,
                updatedAt: chatMessage.updatedAt,
            } )

        // Create empty assistant message
        const [assistantMessage] = await db
            .insert( chatMessage )
            .values( {
                threadId: thread.id,
                userId: currentUser.id,
                role: 'assistant',
                content: '',
                regenerationCount: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            } )
            .returning( {
                id: chatMessage.id,
                threadId: chatMessage.threadId,
                role: chatMessage.role,
                content: chatMessage.content,
                regenerationCount: chatMessage.regenerationCount,
                createdAt: chatMessage.createdAt,
                updatedAt: chatMessage.updatedAt,
            } )

        const completionId = `chatcmpl-${assistantMessage.id}`
        const created = Math.floor( Date.now() / 1000 )

        if ( !shouldStream ) {
            let fullContent = ''

            for await ( const chunk of generateAssistantReplyStream( content, 0 ) ) {
                fullContent += chunk
            }

            await persistAssistantContent( {
                messageId: assistantMessage.id,
                threadId: thread.id,
                content: fullContent,
            } )

            return new Response(
                JSON.stringify(
                    toOpenAiCompletion( {
                        id: completionId,
                        created,
                        model,
                        content: fullContent,
                    } ),
                ),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        ...withCompatHeaders( thread.id, assistantMessage.id, userMessage.id ),
                    },
                },
            )
        }

        // Stream the response
        const encoder = new TextEncoder()
        let fullContent = ''

        const responseStream = new ReadableStream( {
            async start( controller ) {
                let isClosed = false
                const close = () => {
                    if ( isClosed ) {
                        return
                    }
                    isClosed = true
                    controller.close()
                }

                try {
                    const abortController = new AbortController()
                    const requestAbortHandler = () => abortController.abort()
                    request.signal.addEventListener( 'abort', requestAbortHandler )

                    controller.enqueue(
                        encoder.encode(
                            toSseEvent(
                                toOpenAiChunk( {
                                    id: completionId,
                                    created,
                                    model,
                                    delta: { role: 'assistant' },
                                    finishReason: null,
                                } ),
                            ),
                        ),
                    )

                    for await ( const chunk of generateAssistantReplyStream(
                        content,
                        0,
                        abortController.signal,
                    ) ) {
                        fullContent += chunk

                        controller.enqueue(
                            encoder.encode(
                                toSseEvent(
                                    toOpenAiChunk( {
                                        id: completionId,
                                        created,
                                        model,
                                        delta: { content: chunk },
                                        finishReason: null,
                                    } ),
                                ),
                            ),
                        )
                    }

                    await persistAssistantContent( {
                        messageId: assistantMessage.id,
                        threadId: thread.id,
                        content: fullContent,
                    } )

                    controller.enqueue(
                        encoder.encode(
                            toSseEvent(
                                toOpenAiChunk( {
                                    id: completionId,
                                    created,
                                    model,
                                    delta: {},
                                    finishReason: 'stop',
                                } ),
                            ),
                        ),
                    )

                    controller.enqueue( encoder.encode( toSseEvent( '[DONE]' ) ) )

                    request.signal.removeEventListener( 'abort', requestAbortHandler )
                    close()
                } catch ( error ) {
                    if ( error instanceof Error && error.name !== 'AbortError' ) {
                        console.error( '[Chat Stream] Error:', error )

                        const errorMsg = {
                            error: {
                                message: error.message,
                                type: 'server_error',
                            },
                        }

                        controller.enqueue(
                            encoder.encode( toSseEvent( errorMsg ) ),
                        )
                    }

                    close()
                }
            },
        } )

        return new Response( responseStream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                ...withCompatHeaders( thread.id, assistantMessage.id, userMessage.id ),
            },
        } )
    } catch ( error ) {
        console.error( '[Chat Stream] Request error:', error )
        return json(
            {
                error: {
                    message: error instanceof Error ? error.message : 'Stream request failed',
                    type: 'invalid_request_error',
                },
            },
            { status: 400 },
        )
    }
}
