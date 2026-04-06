import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { env } from 'cloudflare:workers'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { buildUrlImportJobKey } from '@/lib/url-import/keys'
import { markStatus } from '@/lib/url-import/workflow-helpers'
import {
  UrlImportQueueMessageSchema,
  UrlImportRequestSchema,
} from '@/lib/url-import/types'

type UrlImportQueueBinding = {
  send: (message: unknown) => Promise<void>
}

type UrlImportServerEnv = {
  KV: KVNamespace
  URL_IMPORT_QUEUE: UrlImportQueueBinding
}

type CreateUrlImportResponse = {
  jobId: string
  status: 'queued'
}

function getImportEnv(): UrlImportServerEnv {
  return env as unknown as UrlImportServerEnv
}

export const createUrlImportJobFn = createServerFn({ method: 'POST' })
  .inputValidator(UrlImportRequestSchema)
  .handler(async ({ data }): Promise<CreateUrlImportResponse> => {
    const user = await getAuthenticatedUser()
    const jobId = crypto.randomUUID()
    const payload = UrlImportQueueMessageSchema.parse({
      jobId,
      userId: user.id,
      url: data.url,
      method: data.method,
      headers: data.headers,
      cookies: data.cookies,
      savePath: data.savePath,
      parentFolderId: data.parentFolderId ?? null,
      createdAtIso: new Date().toISOString(),
    })

    const importEnv = getImportEnv()
    await importEnv.URL_IMPORT_QUEUE.send(payload)
    await markStatus({
      kv: importEnv.KV,
      payload,
      status: 'queued',
      error: null,
    })

    return { jobId, status: 'queued' }
  })

const UrlImportStatusInputSchema = z.object({
  jobId: z.string().min(1),
})

export const getUrlImportJobStatusFn = createServerFn({ method: 'GET' })
  .inputValidator(UrlImportStatusInputSchema)
  .handler(async ({ data }) => {
    await getAuthenticatedUser()
    const importEnv = getImportEnv()
    const key = buildUrlImportJobKey(data.jobId)
    const raw = await importEnv.KV.get(key)
    if (!raw) {
      return {
        jobId: data.jobId,
        status: 'failed' as const,
        error: 'Import job was not found',
      }
    }

    const parsed = JSON.parse(raw) as {
      jobId: string
      status: 'queued' | 'running' | 'failed' | 'completed'
      error: string | null
      url: string
      savePath: string
      queuedAtIso: string
    }

    return parsed
  })
