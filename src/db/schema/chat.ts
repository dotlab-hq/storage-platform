import { relations, sql } from 'drizzle-orm'
import { check, index, integer, text } from 'drizzle-orm/sqlite-core'
import { user } from './auth-schema'
import { schema } from './schema'

export const chatThread = schema.table(
  'chat_thread',
  {
    id: text('id')
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    latestPreview: text('latest_preview'),
    lastMessageAt: integer('last_message_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
    isDeleted: integer('is_deleted', { mode: 'boolean' })
      .default(false)
      .notNull(),
    deletedAt: integer('deleted_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('chatThread_userId_idx').on(table.userId),
    index('chatThread_lastMessageAt_idx').on(table.lastMessageAt),
    index('chatThread_isDeleted_idx').on(table.isDeleted),
  ],
)

export const chatMessage = schema.table(
  'chat_message',
  {
    id: text('id')
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    threadId: text('thread_id')
      .notNull()
      .references(() => chatThread.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: text('role').notNull(),
    content: text('content').notNull(),
    regenerationCount: integer('regeneration_count').default(0).notNull(),
    isDeleted: integer('is_deleted', { mode: 'boolean' })
      .default(false)
      .notNull(),
    deletedAt: integer('deleted_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('chatMessage_threadId_idx').on(table.threadId),
    index('chatMessage_userId_idx').on(table.userId),
    index('chatMessage_createdAt_idx').on(table.createdAt),
    index('chatMessage_isDeleted_idx').on(table.isDeleted),
    check(
      'chat_message_role_check',
      sql`${table.role} IN ('user', 'assistant')`,
    ),
  ],
)

export const chatMessageVersion = schema.table(
  'chat_message_version',
  {
    id: text('id')
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    messageId: text('message_id')
      .notNull()
      .references(() => chatMessage.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    versionNumber: integer('version_number').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index('chatMessageVersion_messageId_idx').on(table.messageId),
    index('chatMessageVersion_versionNumber_idx').on(table.versionNumber),
  ],
)

export const chatThreadRelations = relations(chatThread, ({ one, many }) => ({
  owner: one(user, {
    fields: [chatThread.userId],
    references: [user.id],
  }),
  messages: many(chatMessage),
}))

export const chatMessageRelations = relations(chatMessage, ({ one, many }) => ({
  thread: one(chatThread, {
    fields: [chatMessage.threadId],
    references: [chatThread.id],
  }),
  owner: one(user, {
    fields: [chatMessage.userId],
    references: [user.id],
  }),
  versions: many(chatMessageVersion),
}))

export const chatMessageVersionRelations = relations(
  chatMessageVersion,
  ({ one }) => ({
    message: one(chatMessage, {
      fields: [chatMessageVersion.messageId],
      references: [chatMessage.id],
    }),
  }),
)
