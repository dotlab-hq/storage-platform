import { z } from 'zod'

export const HttpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'PATCH'])

export const KeyValueSchema = z.object({
  key: z.string().trim().min(1),
  value: z.string(),
})

export const UrlImportRequestSchema = z.object({
  url: z.string().url(),
  method: HttpMethodSchema,
  headers: z.array(KeyValueSchema).max(25).default([]),
  cookies: z.array(KeyValueSchema).max(25).default([]),
  savePath: z.string().trim().min(1).max(240),
  parentFolderId: z.string().nullable().optional(),
})

export const UrlImportQueueMessageSchema = z.object({
  jobId: z.string().min(1),
  userId: z.string().min(1),
  url: z.string().url(),
  method: HttpMethodSchema,
  headers: z.array(KeyValueSchema),
  cookies: z.array(KeyValueSchema),
  savePath: z.string().trim().min(1).max(240),
  parentFolderId: z.string().nullable(),
  createdAtIso: z.string().datetime(),
})

export type UrlImportRequest = z.infer<typeof UrlImportRequestSchema>
export type UrlImportQueueMessage = z.infer<typeof UrlImportQueueMessageSchema>

export type UrlImportJobStatus = 'queued' | 'running' | 'failed' | 'completed'

export type UrlImportJobState = {
  jobId: string
  userId: string
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH'
  headers: { key: string; value: string }[]
  cookies: { key: string; value: string }[]
  savePath: string
  parentFolderId: string | null
  status: UrlImportJobStatus
  error: string | null
  queuedAtIso: string
  updatedAtIso: string
}

export const UrlImportJobRecordSchema = z.object({
  jobId: z.string().min(1),
  userId: z.string().min(1),
  url: z.string().url(),
  method: HttpMethodSchema,
  headers: z.array(KeyValueSchema),
  cookies: z.array(KeyValueSchema),
  savePath: z.string().trim().min(1).max(240),
  parentFolderId: z.string().nullable(),
  status: z.enum(['queued', 'running', 'failed', 'completed']),
  error: z.string().nullable(),
  queuedAtIso: z.string().datetime(),
  updatedAtIso: z.string().datetime(),
})

export type UrlImportJobRecord = z.infer<typeof UrlImportJobRecordSchema>
