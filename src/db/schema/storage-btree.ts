import { relations } from 'drizzle-orm'
import { integer, index, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { schema } from './schema'
import { user } from './auth-schema'

export const storageNodeBtree = schema.table(
  'storage_node_btree',
  {
    id: text('id')
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    nodeType: text('node_type').notNull(),
    nodeId: text('node_id').notNull(),
    parentFolderId: text('parent_folder_id'),
    folderPath: text('folder_path').notNull(),
    fullPath: text('full_path').notNull(),
    name: text('name').notNull(),
    isDeleted: integer('is_deleted', { mode: 'boolean' })
      .default(false)
      .notNull(),
    sizeInBytes: integer('size_in_bytes', { mode: 'number' }),
    etag: text('etag'),
    lastModified: integer('last_modified', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('storageNodeBtree_user_node_unq').on(
      table.userId,
      table.nodeType,
      table.nodeId,
    ),
    index('storageNodeBtree_user_folder_idx').on(
      table.userId,
      table.folderPath,
      table.isDeleted,
      table.nodeType,
      table.name,
    ),
    index('storageNodeBtree_user_fullPath_idx').on(
      table.userId,
      table.fullPath,
      table.isDeleted,
    ),
    index('storageNodeBtree_user_parent_idx').on(
      table.userId,
      table.parentFolderId,
      table.nodeType,
      table.isDeleted,
    ),
  ],
)

export const storageNodeBtreeRelations = relations(
  storageNodeBtree,
  ({ one }) => ({
    owner: one(user, {
      fields: [storageNodeBtree.userId],
      references: [user.id],
    }),
  }),
)
