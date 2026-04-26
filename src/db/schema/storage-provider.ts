import { integer, index, text, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { schema } from './schema'
import { UNDETERMINED_PROVIDER_VALUE } from '@/lib/storage-provider-constants'
import { user } from './auth-schema'
import { sql } from 'drizzle-orm'

const DEFAULT_PROVIDER_LIMIT_BYTES = 50 * 1024 * 1024 * 1024
const DEFAULT_PROVIDER_FILE_SIZE_LIMIT_BYTES = DEFAULT_PROVIDER_LIMIT_BYTES

export const storageProvider = schema.table(
  'storage_provider',
  {
    id: text('id')
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    name: text('name').notNull(),
    endpoint: text('endpoint').default(UNDETERMINED_PROVIDER_VALUE).notNull(),
    region: text('region').default(UNDETERMINED_PROVIDER_VALUE).notNull(),
    bucketName: text('bucket_name')
      .default(UNDETERMINED_PROVIDER_VALUE)
      .notNull(),
    accessKeyIdEncrypted: text('access_key_id_encrypted')
      .default(UNDETERMINED_PROVIDER_VALUE)
      .notNull(),
    secretAccessKeyEncrypted: text('secret_access_key_encrypted')
      .default(UNDETERMINED_PROVIDER_VALUE)
      .notNull(),
    storageLimitBytes: integer('storage_limit_bytes', { mode: 'number' })
      .default(DEFAULT_PROVIDER_LIMIT_BYTES)
      .notNull(),
    fileSizeLimitBytes: integer('file_size_limit_bytes', { mode: 'number' })
      .default(DEFAULT_PROVIDER_FILE_SIZE_LIMIT_BYTES)
      .notNull(),
    proxyUploadsEnabled: integer('proxy_uploads_enabled', { mode: 'boolean' })
      .default(false)
      .notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('storageProvider_isActive_idx').on(table.isActive),
    index('storageProvider_userId_idx').on(table.userId),
    uniqueIndex('storageProvider_userId_name_unq').on(table.userId, table.name),
    uniqueIndex('storageProvider_system_name_unq')
      .on(table.name)
      .where(sql`user_id IS NULL`),
  ],
)
