import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { chatMessage, chatThread } from '@/db/schema/chat'

export type OwnedThreadRow = {
  id: string
  title: string
  latestPreview: string | null
  lastMessageAt: Date
  createdAt: Date
  updatedAt: Date
}

export type OwnedMessageRow = {
  id: string
  threadId: string
  role: string
  content: string
  regenerationCount: number
  createdAt: Date
  updatedAt: Date
}

function toPreview(content: string): string {
  const compact = content.trim().replace(/\s+/g, ' ')
  return compact.length > 160 ? `${compact.slice(0, 160)}...` : compact
}

export async function findOwnedThread(
  userId: string,
  threadId: string,
): Promise<OwnedThreadRow | null> {
  const [row] = await db
    .select({
      id: chatThread.id,
      title: chatThread.title,
      latestPreview: chatThread.latestPreview,
      lastMessageAt: chatThread.lastMessageAt,
      createdAt: chatThread.createdAt,
      updatedAt: chatThread.updatedAt,
    })
    .from(chatThread)
    .where(
      and(
        eq(chatThread.id, threadId),
        eq(chatThread.userId, userId),
        eq(chatThread.isDeleted, false),
      ),
    )
    .limit(1)
  return row ?? null
}

export async function findOwnedMessage(
  userId: string,
  messageId: string,
): Promise<OwnedMessageRow | null> {
  const [row] = await db
    .select({
      id: chatMessage.id,
      threadId: chatMessage.threadId,
      role: chatMessage.role,
      content: chatMessage.content,
      regenerationCount: chatMessage.regenerationCount,
      createdAt: chatMessage.createdAt,
      updatedAt: chatMessage.updatedAt,
    })
    .from(chatMessage)
    .innerJoin(chatThread, eq(chatThread.id, chatMessage.threadId))
    .where(
      and(
        eq(chatMessage.id, messageId),
        eq(chatMessage.isDeleted, false),
        eq(chatThread.userId, userId),
        eq(chatThread.isDeleted, false),
      ),
    )
    .limit(1)
  return row ?? null
}

export async function refreshThreadLatestMessage(
  threadId: string,
): Promise<void> {
  const [latest] = await db
    .select({
      content: chatMessage.content,
      createdAt: chatMessage.createdAt,
    })
    .from(chatMessage)
    .where(
      and(eq(chatMessage.threadId, threadId), eq(chatMessage.isDeleted, false)),
    )
    .orderBy(desc(chatMessage.createdAt))
    .limit(1)

  if (latest) {
    await db
      .update(chatThread)
      .set({
        latestPreview: toPreview(latest.content),
        lastMessageAt: latest.createdAt,
        updatedAt: new Date(),
      })
      .where(eq(chatThread.id, threadId))
    return
  }

  const [thread] = await db
    .select({ createdAt: chatThread.createdAt })
    .from(chatThread)
    .where(eq(chatThread.id, threadId))
    .limit(1)

  await db
    .update(chatThread)
    .set({
      latestPreview: null,
      lastMessageAt: thread?.createdAt ?? new Date(),
      updatedAt: new Date(),
    })
    .where(eq(chatThread.id, threadId))
}
