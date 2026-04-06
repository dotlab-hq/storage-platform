import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { env } from 'cloudflare:workers'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { buildUrlImportJobKey } from '@/lib/url-import/keys'
import { readJobHistory } from '@/lib/url-import/history'
import { markStatus } from '@/lib/url-import/workflow-helpers'
import {
  UrlImportJobRecordSchema,
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
    const user = await getAuthenticatedUser()
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

    const parsedUnknown = JSON.parse(raw) as unknown
    const parsed = UrlImportJobRecordSchema.safeParse(parsedUnknown)
    if (!parsed.success || parsed.data.userId !== user.id) {
      return {
        jobId: data.jobId,
        status: 'failed' as const,
        error: 'Import job was not found',
      }
    }

    return parsed.data
  })

const UrlImportValidateInputSchema = z.object({
  url: z.string().url(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH']).default('GET'),
  headers: z
    .array(z.object({ key: z.string().min(1), value: z.string() }))
    .default([]),
  cookies: z
    .array(z.object({ key: z.string().min(1), value: z.string() }))
    .default([]),
})

function buildCookieHeader(
  cookies: { key: string; value: string }[],
): string | null {
  if (cookies.length === 0) {
    return null
  }
  return cookies.map((cookie) => `${cookie.key}=${cookie.value}`).join('; ')
}

export const validateUrlImportTargetFn = createServerFn({ method: 'POST' })
  .inputValidator(UrlImportValidateInputSchema)
  .handler(async ({ data }) => {
    await getAuthenticatedUser()

    const headers = new Headers()
    for (const pair of data.headers) {
      headers.set(pair.key, pair.value)
    }
    const cookieHeader = buildCookieHeader(data.cookies)
    if (cookieHeader) {
      headers.set('cookie', cookieHeader)
    }

    const requestMethod = data.method === 'GET' ? 'HEAD' : data.method
    try {
      const response = await fetch(data.url, {
        method: requestMethod,
        headers,
        redirect: 'follow',
        signal: AbortSignal.timeout(10_000),
      })

      if (!response.ok) {
        return {
          ok: false as const,
          message: `Validation failed with status ${response.status}`,
          status: response.status,
          contentType: response.headers.get('content-type') ?? 'unknown',
          finalUrl: response.url,
        }
      }

      return {
        ok: true as const,
        message: `Reachable. content-type: ${response.headers.get('content-type') ?? 'unknown'}`,
        status: response.status,
        contentType: response.headers.get('content-type') ?? 'unknown',
        finalUrl: response.url,
      }
    } catch (error) {
      return {
        ok: false as const,
        message:
          error instanceof Error ? error.message : 'Validation request failed',
        status: 0,
        contentType: 'unknown',
        finalUrl: data.url,
      }
    }
  })

export const getUrlImportHistoryFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await getAuthenticatedUser()
    const importEnv = getImportEnv()
    return readJobHistory(importEnv.KV, user.id)
  },
)
