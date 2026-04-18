import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '@/db'
import { chatMessage, chatThread } from '@/db/schema/chat'
import { getAuthenticatedUser } from '@/lib/server-auth'
import {
  deriveThreadTitle,
  toMessageSnapshot,
  toThreadSnapshot,
} from './-chat-server-utils'
import { generateAssistantReplyStream } from './-chat-assistant-reply-stream'
import { findOwnedThread, refreshThreadLatestMessage } from './-chat-server-db'
import type { SendChatMessageResult } from './-chat-types'

const SendMessageSchema = z.object( {
  threadId: z.string().min( 1 ).optional(),
  content: z.string().trim().min( 1 ).max( 6000 ),
} )

async function getOrCreateThread(
  userId: string,
  threadId: string | null,
  content: string,
) {
  if ( threadId ) {
    const existing = await findOwnedThread( userId, threadId )
    if ( !existing ) {
      throw new Error( 'Thread not found.' )
    }
    return existing
  }

  const now = new Date()
  const [created] = await db
    .insert( chatThread )
    .values( {
      userId,
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
  return created
}

export const sendChatMessageFn = createServerFn( { method: 'POST' } )
  .inputValidator( SendMessageSchema )
  .handler( async ( { data } ): Promise<SendChatMessageResult> => {
    const currentUser = await getAuthenticatedUser()
    const thread = await getOrCreateThread(
      currentUser.id,
      data.threadId ?? null,
      data.content,
    )
    const now = new Date()

    const [userMessage] = await db
      .insert( chatMessage )
      .values( {
        threadId: thread.id,
        userId: currentUser.id,
        role: 'user',
        content: data.content,
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

    // Stream assistant reply
    let assistantContent = ''

    try {
      for await ( const chunk of generateAssistantReplyStream(
        data.content,
        0,
      ) ) {
        assistantContent += chunk
      }
    } catch ( error ) {
      console.error( '[Chat] Stream generation error:', error )
      assistantContent =
        'I encountered an error while generating a response. Please try again.'
    }

    const [assistantMessage] = await db
      .insert( chatMessage )
      .values( {
        threadId: thread.id,
        userId: currentUser.id,
        role: 'assistant',
        content: assistantContent,
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

    await refreshThreadLatestMessage( thread.id )
    const refreshed = await findOwnedThread( currentUser.id, thread.id )

    if ( !refreshed ) {
      throw new Error( 'Thread refresh failed.' )
    }

    return {
      thread: toThreadSnapshot( refreshed ),
      userMessage: toMessageSnapshot( userMessage ),
      assistantMessage: toMessageSnapshot( assistantMessage ),
    }
  } )
