import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { chatMessage, chatMessageVersion } from '@/db/schema/chat'
import { getAuthenticatedUser } from '@/lib/server-auth.server'
import { logActivity } from '@/lib/activity'
import { toMessageSnapshot } from './-chat-server-utils'
import { generateAssistantReplyStream } from './-chat-assistant-reply-stream'
import { findOwnedMessage, refreshThreadLatestMessage } from './-chat-server-db'

const RegenerateMessageSchema = z.object({
  messageId: z.string().min(1),
})

const DeleteMessageSchema = z.object({
  messageId: z.string().min(1),
})

export const regenerateMessageFn = createServerFn({ method: 'POST' })
  .inputValidator(RegenerateMessageSchema)
  .handler(async ({ data }) => {
    const currentUser = await getAuthenticatedUser()
    const target = await findOwnedMessage(currentUser.id, data.messageId)

    if (!target) {
      throw new Error('Message not found.')
    }

    if (target.role !== 'assistant') {
      throw new Error('Only assistant messages can be regenerated.')
    }

    await db.insert(chatMessageVersion).values({
      messageId: target.id,
      content: target.content,
      versionNumber: target.regenerationCount + 1,
      createdAt: new Date(),
    })

    const [lastUserMessage] = await db
      .select({ content: chatMessage.content })
      .from(chatMessage)
      .where(
        and(
          eq(chatMessage.threadId, target.threadId),
          eq(chatMessage.role, 'user'),
          eq(chatMessage.isDeleted, false),
        ),
      )
      .orderBy(desc(chatMessage.createdAt))
      .limit(1)

    const prompt = lastUserMessage?.content ?? target.content
    let assistantContent = ''

    try {
      for await (const chunk of generateAssistantReplyStream(
        prompt,
        target.regenerationCount + 1,
      )) {
        assistantContent += chunk
      }
    } catch (error) {
      console.error('[Chat] Regenerate stream error:', error)
      assistantContent =
        'I encountered an error while regenerating the response. Please try again.'
    }

    const [updated] = await db
      .update(chatMessage)
      .set({
        content: assistantContent,
        regenerationCount: target.regenerationCount + 1,
        updatedAt: new Date(),
      })
      .where(eq(chatMessage.id, target.id))
      .returning({
        id: chatMessage.id,
        threadId: chatMessage.threadId,
        role: chatMessage.role,
        content: chatMessage.content,
        regenerationCount: chatMessage.regenerationCount,
        createdAt: chatMessage.createdAt,
        updatedAt: chatMessage.updatedAt,
      })

    if (!updated) {
      throw new Error('Failed to regenerate message.')
    }

    await refreshThreadLatestMessage(target.threadId)
    await logActivity({
      userId: currentUser.id,
      eventType: 'message_regenerate',
      resourceType: 'chatMessage',
      resourceId: target.id,
      tags: ['Chat'],
      meta: {
        threadId: target.threadId,
        regenerationCount: updated.regenerationCount,
      },
    })

    return { message: toMessageSnapshot(updated) }
  })

export const deleteMessageFn = createServerFn({ method: 'POST' })
  .inputValidator(DeleteMessageSchema)
  .handler(async ({ data }) => {
    const currentUser = await getAuthenticatedUser()
    const target = await findOwnedMessage(currentUser.id, data.messageId)

    if (!target) {
      throw new Error('Message not found.')
    }

    await db
      .update(chatMessage)
      .set({ isDeleted: true, deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(chatMessage.id, target.id))

    await refreshThreadLatestMessage(target.threadId)
    await logActivity({
      userId: currentUser.id,
      eventType: 'message_delete',
      resourceType: 'chatMessage',
      resourceId: target.id,
      tags: ['Chat'],
      meta: { threadId: target.threadId },
    })

    return { ok: true as const, threadId: target.threadId }
  })
