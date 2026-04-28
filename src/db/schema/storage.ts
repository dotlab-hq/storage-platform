import { relations, sql } from 'drizzle-orm'
import { integer, index, text, check } from 'drizzle-orm/sqlite-core'
import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core'
import { user } from './auth-schema'
import { storageProvider } from './storage-provider'
import { schema } from './schema'
import {
  DEFAULT_ALLOCATED_STORAGE_BYTES,
  DEFAULT_FILE_SIZE_LIMIT_BYTES,
} from '@/lib/storage-quota-constants'

export const folder = schema.table(
  'folder',
  {
    id: text('id')
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    name: text('name').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    parentFolderId: text('parent_folder_id').references(
      (): AnySQLiteColumn => folder.id,
      {
        onDelete: 'set null',
      },
    ),
    virtualBucketId: text('virtual_bucket_id').unique(),
    isPrivatelyLocked: integer('is_privately_locked', { mode: 'boolean' })
      .default(false)
      .notNull(),
    isDeleted: integer('is_deleted', { mode: 'boolean' })
      .default(false)
      .notNull(),
    deletedAt: integer('deleted_at', { mode: 'timestamp' }),
    isTrashed: integer('is_trashed', { mode: 'boolean' })
      .default(false)
      .notNull(),
    deletionQueuedAt: integer('deletion_queued_at', { mode: 'timestamp' }),
    lastOpenedAt: integer('last_opened_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('folder_userId_idx').on(table.userId),
    index('folder_parentFolderId_idx').on(table.parentFolderId),
    index('folder_isTrashed_idx').on(table.isTrashed),
    index('folder_deletionQueuedAt_idx').on(table.deletionQueuedAt),
  ],
)

export const file = schema.table(
  'file',
  {
    id: text('id')
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    name: text('name').notNull(),
    objectKey: text('object_key').notNull(),
    mimeType: text('mime_type'),
    etag: text('etag'),
    cacheControl: text('cache_control'),
    lastModified: integer('last_modified', { mode: 'timestamp' }),
    sizeInBytes: integer('size_in_bytes', { mode: 'number' }).notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    providerId: text('provider_id').references(() => storageProvider.id, {
      onDelete: 'set null',
    }),
    folderId: text('folder_id').references(() => folder.id, {
      onDelete: 'set null',
    }),
    isPrivatelyLocked: integer('is_privately_locked', { mode: 'boolean' })
      .default(false)
      .notNull(),
    isDeleted: integer('is_deleted', { mode: 'boolean' })
      .default(false)
      .notNull(),
    deletedAt: integer('deleted_at', { mode: 'timestamp' }),
    isTrashed: integer('is_trashed', { mode: 'boolean' })
      .default(false)
      .notNull(),
    deletionQueuedAt: integer('deletion_queued_at', { mode: 'timestamp' }),
    lastOpenedAt: integer('last_opened_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('file_userId_idx').on(table.userId),
    index('file_providerId_idx').on(table.providerId),
    index('file_folderId_idx').on(table.folderId),
    index('file_isTrashed_idx').on(table.isTrashed),
    index('file_deletionQueuedAt_idx').on(table.deletionQueuedAt),
  ],
)

export const shareLink = schema.table(
  'share_link',
  {
    id: text('id')
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    fileId: text('file_id').references(() => file.id, { onDelete: 'cascade' }),
    folderId: text('folder_id').references(() => folder.id, {
      onDelete: 'cascade',
    }),
    sharedByUserId: text('shared_by_user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    shareToken: text('share_token').notNull().unique(),
    requiresAuth: integer('requires_auth', { mode: 'boolean' })
      .default(false)
      .notNull(),
    consentedPrivatelyUnlock: integer('consented_privately_unlock', {
      mode: 'boolean',
    })
      .default(false)
      .notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index('shareLink_fileId_idx').on(table.fileId),
    index('shareLink_folderId_idx').on(table.folderId),
    index('shareLink_sharedByUserId_idx').on(table.sharedByUserId),
    check(
      'share_link_target_check',
      sql`("file_id" IS NOT NULL AND "folder_id" IS NULL) OR ("file_id" IS NULL AND "folder_id" IS NOT NULL)`,
    ),
  ],
)

export const userStorage = schema.table(
  'user_storage',
  {
    userId: text('user_id')
      .primaryKey()
      .references(() => user.id, { onDelete: 'cascade' }),
    allocatedStorage: integer('allocated_storage', { mode: 'number' })
      .default(DEFAULT_ALLOCATED_STORAGE_BYTES)
      .notNull(),
    fileSizeLimit: integer('file_size_limit', { mode: 'number' })
      .default(DEFAULT_FILE_SIZE_LIMIT_BYTES)
      .notNull(),
    usedStorage: integer('used_storage', { mode: 'number' })
      .default(0)
      .notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('userStorage_userId_idx').on(table.userId)],
)

export const folderRelations = relations(folder, ({ one, many }) => ({
  owner: one(user, {
    fields: [folder.userId],
    references: [user.id],
  }),
  parentFolder: one(folder, {
    fields: [folder.parentFolderId],
    references: [folder.id],
    relationName: 'folderParent',
  }),
  childFolders: many(folder, {
    relationName: 'folderParent',
  }),
  files: many(file),
  shareLinks: many(shareLink),
}))

export const fileRelations = relations(file, ({ one, many }) => ({
  owner: one(user, {
    fields: [file.userId],
    references: [user.id],
  }),
  folder: one(folder, {
    fields: [file.folderId],
    references: [folder.id],
  }),
  shares: many(shareLink),
}))

export const shareLinkRelations = relations(shareLink, ({ one }) => ({
  file: one(file, {
    fields: [shareLink.fileId],
    references: [file.id],
  }),
  folder: one(folder, {
    fields: [shareLink.folderId],
    references: [folder.id],
  }),
  sharedByUser: one(user, {
    fields: [shareLink.sharedByUserId],
    references: [user.id],
  }),
}))

export const userStorageRelations = relations(userStorage, ({ one }) => ({
  user: one(user, {
    fields: [userStorage.userId],
    references: [user.id],
  }),
}))
