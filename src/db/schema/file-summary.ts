import { relations, sql } from 'drizzle-orm'
import { check, index, integer, text } from 'drizzle-orm/sqlite-core'
import { user } from './auth-schema'
import { file } from './storage'
import { schema } from './schema'

const STATUS_VALUES_SQL = sql.raw(
  "('queued','processing','completed','failed')",
)
const SOURCE_VALUES_SQL = sql.raw(
  "('metadata-wave','text-content','media-metadata','binary-metadata')",
)

export const fileSummaryJob = schema.table(
  'file_summary_job',
  {
    id: text('id').primaryKey(),
    fileId: text('file_id')
      .notNull()
      .references(() => file.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    model: text('model').notNull(),
    status: text('status').notNull().default('queued'),
    sourceType: text('source_type').notNull().default('metadata-wave'),
    isLargeFile: integer('is_large_file', { mode: 'boolean' })
      .default(false)
      .notNull(),
    attempts: integer('attempts', { mode: 'number' }).default(0).notNull(),
    summaryText: text('summary_text'),
    metadataJson: text('metadata_json').notNull().default('{}'),
    failureReason: text('failure_reason'),
    startedAt: integer('started_at', { mode: 'timestamp' }),
    completedAt: integer('completed_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('fileSummaryJob_fileId_idx').on(table.fileId),
    index('fileSummaryJob_userId_idx').on(table.userId),
    index('fileSummaryJob_status_idx').on(table.status),
    index('fileSummaryJob_updatedAt_idx').on(table.updatedAt),
    check(
      'file_summary_job_status_check',
      sql`${table.status} IN ${STATUS_VALUES_SQL}`,
    ),
    check(
      'file_summary_job_source_check',
      sql`${table.sourceType} IN ${SOURCE_VALUES_SQL}`,
    ),
  ],
)

export const fileSummaryEvent = schema.table(
  'file_summary_event',
  {
    id: text('id')
      .$defaultFn(() => crypto.randomUUID())
      .primaryKey(),
    jobId: text('job_id')
      .notNull()
      .references(() => fileSummaryJob.id, { onDelete: 'cascade' }),
    status: text('status').notNull(),
    message: text('message'),
    detailJson: text('detail_json').notNull().default('{}'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index('fileSummaryEvent_jobId_idx').on(table.jobId),
    index('fileSummaryEvent_createdAt_idx').on(table.createdAt),
    check(
      'file_summary_event_status_check',
      sql`${table.status} IN ${STATUS_VALUES_SQL}`,
    ),
  ],
)

export const fileSummaryJobRelations = relations(
  fileSummaryJob,
  ({ one, many }) => ({
    file: one(file, {
      fields: [fileSummaryJob.fileId],
      references: [file.id],
    }),
    owner: one(user, {
      fields: [fileSummaryJob.userId],
      references: [user.id],
    }),
    events: many(fileSummaryEvent),
  }),
)

export const fileSummaryEventRelations = relations(
  fileSummaryEvent,
  ({ one }) => ({
    job: one(fileSummaryJob, {
      fields: [fileSummaryEvent.jobId],
      references: [fileSummaryJob.id],
    }),
  }),
)
