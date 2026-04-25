import { createServerFn } from '@tanstack/react-start'
import { and, asc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { chatMessage } from '@/db/schema/chat'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { toMessageSnapshot } from './-chat-server-utils'
import { findOwnedThread } from './-chat-server-db'
import type { PaginatedMessages } from './-chat-types'

const MessagePaginationSchema = z.object({
  threadId: z.string().min(1),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(30),
})

export const listThreadMessagesFn = createServerFn({ method: 'GET' })
  .inputValidator(MessagePaginationSchema)
  .handler(async ({ data }): Promise<PaginatedMessages> => {
    const currentUser = await getAuthenticatedUser()
    const thread = await findOwnedThread(currentUser.id, data.threadId)

    if (!thread) {
      throw new Error('Thread not found.')
    }

    const offset = (data.page - 1) * data.limit
    const [rows, countRows] = await Promise.all([
      db
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
        .where(
          and(
            eq(chatMessage.threadId, data.threadId),
            eq(chatMessage.isDeleted, false),
          ),
        )
        .orderBy(asc(chatMessage.createdAt))
        .limit(data.limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(chatMessage)
        .where(
          and(
            eq(chatMessage.threadId, data.threadId),
            eq(chatMessage.isDeleted, false),
          ),
        ),
    ])

    const totalCount = countRows[0]?.count ?? 0
    return {
      items: rows.map(toMessageSnapshot),
      page: data.page,
      limit: data.limit,
      hasMore: offset + rows.length < totalCount,
    }
  })
