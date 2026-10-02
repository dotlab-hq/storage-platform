import type {
  S3BucketActionResponse,
  S3BucketCredentials,
  S3BucketCredentialsResponse,
  S3BucketItem,
} from '@/types/s3-buckets'
import { readApiError, readJsonSafely } from '@/hooks/use-s3-buckets.helpers'

/**
 * HTTP requests behind the bucket mutations. Each one throws an Error with a
 * user-facing message on failure; cache updates live in `use-s3-buckets.ts`.
 */

export type BucketAction = 'empty' | 'delete'

async function postJson(url: string, body: unknown) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

/** Creates a bucket and returns the stored record. */
export async function createBucketRequest(
  bucketName: string,
): Promise<S3BucketItem> {
  const response = await postJson('/api/storage/s3/buckets', { bucketName })
  if (!response.ok) {
    throw new Error(await readApiError(response, 'Failed to create bucket'))
  }
  const payload = await readJsonSafely<S3BucketActionResponse>(response)
  if (!payload?.ok) {
    throw new Error(payload?.error ?? 'Failed to create bucket')
  }
  return payload.bucket
}

/** Empties or deletes a bucket. */
export async function bucketActionRequest(
  bucketName: string,
  action: BucketAction,
): Promise<void> {
  const endpoint =
    action === 'empty'
      ? '/api/storage/s3/empty-bucket'
      : '/api/storage/s3/delete-bucket'
  const response = await postJson(endpoint, { bucketName })
  if (!response.ok) {
    throw new Error(await readApiError(response, `Failed to ${action} bucket`))
  }
}

async function credentialsRequest(
  url: string,
  body: unknown,
  fallback: string,
): Promise<S3BucketCredentials> {
  const response = await postJson(url, body)
  if (!response.ok) {
    throw new Error(await readApiError(response, fallback))
  }
  const payload = await readJsonSafely<S3BucketCredentialsResponse>(response)
  if (!payload?.ok) {
    throw new Error(payload?.error ?? fallback)
  }
  return payload.credentials
}

/** Fetches the S3 credentials of a bucket. */
export function fetchCredentialsRequest(bucketName: string) {
  return credentialsRequest(
    '/api/storage/s3/bucket-credentials',
    { bucketName },
    'Failed to fetch credentials',
  )
}

/** Rotates the S3 credentials of a bucket and returns the new ones. */
export function rotateCredentialsRequest(bucketName: string) {
  return credentialsRequest(
    '/api/storage/s3/rotate-credentials',
    { bucketName },
    'Failed to rotate credentials',
  )
}
