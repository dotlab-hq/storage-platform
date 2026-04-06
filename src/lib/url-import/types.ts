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
  url: string
  savePath: string
  status: UrlImportJobStatus
  error: string | null
  queuedAtIso: string
}
