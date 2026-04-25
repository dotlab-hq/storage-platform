import type { QueryClient } from '@tanstack/react-query'
import type {
  S3BucketActionResponse,
  S3BucketCredentials,
  S3BucketCredentialsResponse,
} from '@/types/s3-buckets'
import { parseJson, readApiError } from '@/hooks/use-s3-buckets.helpers'

export type BucketActionResult = {
  ok: boolean
  error: string | null
}

const BUCKETS_QUERY_KEY = ['s3-buckets'] as const

type SetError = (value: string | null) => void
type SetPendingBucket = (
  bucketName: string,
  pending: 'empty' | 'delete' | undefined,
) => void
type SetCredential = (
  bucketName: string,
  credentials: S3BucketCredentials,
) => void

export async function createBucketWithOptimisticUpdate(
  queryClient: QueryClient,
  setError: SetError,
  bucketName: string,
): Promise<BucketActionResult> {
  const normalizedName = bucketName.trim()
  setError(null)

  const tempId = `temp-${crypto.randomUUID()}`
  const tempBucket = {
    id: tempId,
    name: normalizedName,
    mappedFolderId: null,
    isActive: true,
    isDefault: false,
    createdAt: new Date().toISOString(),
  }

  queryClient.setQueryData(BUCKETS_QUERY_KEY, (previous: unknown) => {
    const list = Array.isArray(previous) ? previous : []
    return [tempBucket, ...list]
  })

  try {
    const response = await fetch('/api/storage/s3/buckets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bucketName: normalizedName }),
    })
    const payload = await parseJson<S3BucketActionResponse>(response)
    if (!response.ok || !payload.ok) {
      const message = payload.ok ? 'Failed to create bucket' : payload.error
      throw new Error(message)
    }

    queryClient.setQueryData(BUCKETS_QUERY_KEY, (previous: unknown) => {
      const list = Array.isArray(previous) ? previous : []
      const withoutTemp = list.filter(
        (bucket: { id: string }) => bucket.id !== tempId,
      )
      return [payload.bucket, ...withoutTemp]
    })
    return { ok: true, error: null }
  } catch (createError) {
    queryClient.setQueryData(BUCKETS_QUERY_KEY, (previous: unknown) => {
      const list = Array.isArray(previous) ? previous : []
      return list.filter((bucket: { id: string }) => bucket.id !== tempId)
    })
    const message =
      createError instanceof Error
        ? createError.message
        : 'Failed to create bucket'
    setError(message)
    return { ok: false, error: message }
  }
}

export async function mutateBucketAction(
  queryClient: QueryClient,
  setError: SetError,
  setPendingBucket: SetPendingBucket,
  bucketName: string,
  action: 'empty' | 'delete',
): Promise<BucketActionResult> {
  setPendingBucket(bucketName, action)
  setError(null)

  const previousBuckets = queryClient.getQueryData(BUCKETS_QUERY_KEY)
  if (action === 'delete') {
    queryClient.setQueryData(BUCKETS_QUERY_KEY, (old: unknown) => {
      const list = Array.isArray(old) ? old : []
      return list.filter(
        (bucket: { name: string }) => bucket.name !== bucketName,
      )
    })
  }

  const endpoint =
    action === 'empty'
      ? '/api/storage/s3/empty-bucket'
      : '/api/storage/s3/delete-bucket'

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bucketName }),
    })
    if (!response.ok) {
      throw new Error(
        await readApiError(response, `Failed to ${action} bucket`),
      )
    }
    return { ok: true, error: null }
  } catch (actionError) {
    if (action === 'delete') {
      queryClient.setQueryData(BUCKETS_QUERY_KEY, previousBuckets)
    }
    const message =
      actionError instanceof Error
        ? actionError.message
        : `Failed to ${action} bucket`
    setError(message)
    return { ok: false, error: message }
  } finally {
    setPendingBucket(bucketName, undefined)
  }
}

export async function requestBucketCredentials(
  setError: SetError,
  setCredential: SetCredential,
  bucketName?: string,
) {
  try {
    const response = await fetch('/api/storage/s3/bucket-credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bucketName ? { bucketName } : {}),
    })
    const payload = await parseJson<S3BucketCredentialsResponse>(response)
    if (!response.ok || !payload.ok) {
      const message = payload.ok ? 'Failed to fetch credentials' : payload.error
      throw new Error(message)
    }

    setCredential(payload.credentials.bucket, payload.credentials)
    return payload.credentials
  } catch (fetchError) {
    setError(
      fetchError instanceof Error
        ? fetchError.message
        : 'Failed to fetch credentials',
    )
    return null
  }
}

export async function rotateBucketCredentials(
  setError: SetError,
  bucketName: string,
): Promise<S3BucketCredentials | null> {
  try {
    const response = await fetch('/api/storage/s3/rotate-credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bucketName }),
    })
    const payload = await parseJson<S3BucketCredentialsResponse>(response)
    if (!response.ok || !payload.ok) {
      const message = payload.ok
        ? 'Failed to rotate credentials'
        : payload.error
      throw new Error(message)
    }

    return payload.credentials
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to rotate credentials'
    setError(message)
    return null
  }
}
