import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { chatThread } from '@/db/schema/chat'
import { apiAuthMiddleware } from '@/middlewares/api-auth'
import type { PaginatedThreads } from './-chat-types'
import { toThreadSnapshot } from './-chat-server-utils'

const ThreadPaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
})

const ThreadRenameSchema = z.object({
  threadId: z.string().min(1),
  title: z.string().trim().min(1).max(120),
})

const ThreadDeleteSchema = z.object({
  threadId: z.string().min(1),
})

const ThreadCreateSchema = z.object({
  title: z.string().trim().min(1).max(120),
})

export const listChatThreadsFn = createServerFn({ method: 'GET' })
  .use(apiAuthMiddleware)
  .inputValidator(ThreadPaginationSchema)
  .handler(async ({ data, context }): Promise<PaginatedThreads> => {
    const currentUser = context.user
    const offset = (data.page - 1) * data.limit

    const [rows, countRows] = await Promise.all([
      db
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
            eq(chatThread.userId, currentUser.id),
            eq(chatThread.isDeleted, false),
          ),
        )
        .orderBy(desc(chatThread.lastMessageAt), desc(chatThread.createdAt))
        .limit(data.limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(chatThread)
        .where(
          and(
            eq(chatThread.userId, currentUser.id),
            eq(chatThread.isDeleted, false),
          ),
        ),
    ])

    const totalCount = countRows[0]?.count ?? 0
    return {
      items: rows.map(toThreadSnapshot),
      page: data.page,
      limit: data.limit,
      hasMore: offset + rows.length < totalCount,
    }
  })

export const createChatThreadFn = createServerFn({ method: 'POST' })
  .use(apiAuthMiddleware)
  .inputValidator(ThreadCreateSchema)
  .handler(async ({ data, context }) => {
    const currentUser = context.user
    const now = new Date()

    const [created] = await db
      .insert(chatThread)
      .values({
        userId: currentUser.id,
        title: data.title,
        latestPreview: null,
        lastMessageAt: now,
        createdAt: now,
        updatedAt: now,
      })
      .returning({
        id: chatThread.id,
        title: chatThread.title,
        latestPreview: chatThread.latestPreview,
        lastMessageAt: chatThread.lastMessageAt,
        createdAt: chatThread.createdAt,
        updatedAt: chatThread.updatedAt,
      })

    if (!created) {
      throw new Error('Failed to create thread.')
    }

    return { thread: toThreadSnapshot(created) }
  })

export const renameChatThreadFn = createServerFn({ method: 'POST' })
  .use(apiAuthMiddleware)
  .inputValidator(ThreadRenameSchema)
  .handler(async ({ data, context }) => {
    const currentUser = context.user

    const [updated] = await db
      .update(chatThread)
      .set({ title: data.title, updatedAt: new Date() })
      .where(
        and(
          eq(chatThread.id, data.threadId),
          eq(chatThread.userId, currentUser.id),
          eq(chatThread.isDeleted, false),
        ),
      )
      .returning({
        id: chatThread.id,
        title: chatThread.title,
        latestPreview: chatThread.latestPreview,
        lastMessageAt: chatThread.lastMessageAt,
        createdAt: chatThread.createdAt,
        updatedAt: chatThread.updatedAt,
      })

    if (!updated) {
      throw new Error('Thread not found.')
    }

    return { thread: toThreadSnapshot(updated) }
  })

export const deleteChatThreadFn = createServerFn({ method: 'POST' })
  .use(apiAuthMiddleware)
  .inputValidator(ThreadDeleteSchema)
  .handler(async ({ data, context }) => {
    const currentUser = context.user

    const [updated] = await db
      .update(chatThread)
      .set({ isDeleted: true, deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(chatThread.id, data.threadId),
          eq(chatThread.userId, currentUser.id),
          eq(chatThread.isDeleted, false),
        ),
      )
      .returning({ id: chatThread.id })

    if (!updated) {
      throw new Error('Thread not found.')
    }

    return { ok: true as const }
  })
