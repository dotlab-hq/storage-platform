import { json } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '@/db'
import { chatMessage, chatThread } from '@/db/schema/chat'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { generateAssistantReplyStream } from '../../_app/chat/-chat-assistant-reply-stream'
import { deriveThreadTitle } from '../../_app/chat/-chat-server-utils'
import { findOwnedThread, refreshThreadLatestMessage } from '../../_app/chat/-chat-server-db'

const StreamMessageSchema = z.object( {
    threadId: z.string().min( 1 ).optional(),
    content: z.string().trim().min( 1 ).max( 6000 ),
} )

export async function POST( { request }: { request: Request } ) {
    try {
        const body = await request.json()
        const { threadId, content } = StreamMessageSchema.parse( body )

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

            if ( !created ) {
                throw new Error( 'Failed to create thread.' )
            }
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

        if ( !userMessage ) {
            throw new Error( 'Failed to create user message.' )
        }

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

        if ( !assistantMessage ) {
            throw new Error( 'Failed to create assistant message.' )
        }

        // Stream the response
        const encoder = new TextEncoder()
        let fullContent = ''

        const stream = new ReadableStream( {
            async start( controller ) {
                try {
                    const abortController = new AbortController()
                    const requestAbortHandler = () => abortController.abort()
                    request.signal.addEventListener( 'abort', requestAbortHandler )

                    for await ( const chunk of generateAssistantReplyStream(
                        content,
                        0,
                        abortController.signal,
                    ) ) {
                        fullContent += chunk
                        // Send SSE message with chunk
                        const sseMessage = `data: ${JSON.stringify( { chunk, id: assistantMessage.id } )}\n\n`
                        controller.enqueue( encoder.encode( sseMessage ) )
                    }

                    // Update message in database with full content
                    await db
                        .update( chatMessage )
                        .set( {
                            content: fullContent,
                            updatedAt: new Date(),
                        } )
                        .where( ( t ) => t.id === assistantMessage.id )

                    // Refresh thread latest message
                    await refreshThreadLatestMessage( thread.id )

                    // Send completion message
                    const done = JSON.stringify( {
                        done: true,
                        id: assistantMessage.id,
                        content: fullContent,
                    } )
                    controller.enqueue( encoder.encode( `data: ${done}\n\n` ) )
                    controller.close()

                    request.signal.removeEventListener( 'abort', requestAbortHandler )
                } catch ( error ) {
                    if ( error instanceof Error && error.name !== 'AbortError' ) {
                        console.error( '[Chat Stream] Error:', error )
                        const errorMsg = JSON.stringify( {
                            error: error instanceof Error ? error.message : 'Stream error',
                        } )
                        controller.enqueue(
                            encoder.encode( `data: ${errorMsg}\n\n` ),
                        )
                    }
                    controller.close()
                }
            },
        } )

        return new Response( stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
                'Access-Control-Allow-Origin': '*',
            },
        } )
    } catch ( error ) {
        console.error( '[Chat Stream] Request error:', error )
        return json(
            {
                error: error instanceof Error ? error.message : 'Stream request failed',
            },
            { status: 400 },
        )
    }
}
