import type {
  UrlImportJobRecord,
  UrlImportQueueMessage,
} from '@/lib/url-import/types'
import { UrlImportJobRecordSchema } from '@/lib/url-import/types'
import { buildUrlImportJobKey } from '@/lib/url-import/keys'

const USER_HISTORY_PREFIX = 'url-import-history:'

function userHistoryKey(userId: string): string {
  return `${USER_HISTORY_PREFIX}${userId}`
}

async function readUserHistory(
  kv: KVNamespace,
  userId: string,
): Promise<UrlImportJobRecord[]> {
  const raw = await kv.get(userHistoryKey(userId))
  if (!raw) {
    return []
  }

  const parsed = JSON.parse(raw) as unknown
  if (!Array.isArray(parsed)) {
    return []
  }

  const records: UrlImportJobRecord[] = []
  for (const candidate of parsed) {
    const result = UrlImportJobRecordSchema.safeParse(candidate)
    if (result.success) {
      records.push(result.data)
    }
  }
  return records
}

export async function writeJobRecord(input: {
  kv: KVNamespace
  payload: UrlImportQueueMessage
  status: 'queued' | 'running' | 'failed' | 'completed'
  error: string | null
}): Promise<UrlImportJobRecord> {
  const nowIso = new Date().toISOString()
  const key = buildUrlImportJobKey(input.payload.jobId)
  const existingRaw = await input.kv.get(key)
  const existing = existingRaw
    ? UrlImportJobRecordSchema.safeParse(JSON.parse(existingRaw))
    : null

  const record = UrlImportJobRecordSchema.parse({
    jobId: input.payload.jobId,
    userId: input.payload.userId,
    url: input.payload.url,
    method: input.payload.method,
    headers: input.payload.headers,
    cookies: input.payload.cookies,
    savePath: input.payload.savePath,
    parentFolderId: input.payload.parentFolderId,
    status: input.status,
    error: input.error,
    queuedAtIso: existing?.success
      ? existing.data.queuedAtIso
      : input.payload.createdAtIso,
    updatedAtIso: nowIso,
  })

  await input.kv.put(key, JSON.stringify(record), {
    expirationTtl: 60 * 60 * 24 * 14,
  })

  const current = await readUserHistory(input.kv, input.payload.userId)
  const withoutCurrent = current.filter((job) => job.jobId !== record.jobId)
  const next = [record, ...withoutCurrent]
    .sort((a, b) => b.updatedAtIso.localeCompare(a.updatedAtIso))
    .slice(0, 100)

  await input.kv.put(
    userHistoryKey(input.payload.userId),
    JSON.stringify(next),
    {
      expirationTtl: 60 * 60 * 24 * 14,
    },
  )

  return record
}

export async function readJobHistory(
  kv: KVNamespace,
  userId: string,
): Promise<UrlImportJobRecord[]> {
  const jobs = await readUserHistory(kv, userId)
  return jobs.sort((a, b) => b.updatedAtIso.localeCompare(a.updatedAtIso))
}
