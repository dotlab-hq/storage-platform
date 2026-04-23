import { Cache } from '@/lib/Cache'
import type { BucketContext } from '@/lib/s3-gateway/s3-context'

const CACHE_TTL_SECONDS = 5 * 60

function accessKeyForBucket(bucketId: string): string {
  const compactBucketId = bucketId.replaceAll('-', '').slice(0, 20)
  return `sp_${compactBucketId}`
}

function nameKey(bucketName: string): string {
  return `vbucket:name:${bucketName}`
}

function accessKey(accessKeyId: string): string {
  return `vbucket:access:${accessKeyId}`
}

export async function getCachedBucketByName(
  bucketName: string,
): Promise<BucketContext | null> {
  return Cache.get<BucketContext>(nameKey(bucketName))
}

export async function getCachedBucketByAccessKey(
  accessKeyId: string,
): Promise<BucketContext | null> {
  return Cache.get<BucketContext>(accessKey(accessKeyId))
}

export async function upsertBucketContextCache(
  context: BucketContext,
): Promise<void> {
  const acc = accessKeyForBucket(context.bucketId)
  await Promise.all([
    Cache.set(nameKey(context.bucketName), context, {
      expirationTtl: CACHE_TTL_SECONDS,
    }),
    Cache.set(accessKey(acc), context, {
      expirationTtl: CACHE_TTL_SECONDS,
    }),
  ])
}

export async function removeBucketContextCache(input: {
  bucketName: string
  bucketId: string
}): Promise<void> {
  await Promise.all([
    Cache.delete(nameKey(input.bucketName)),
    Cache.delete(accessKey(accessKeyForBucket(input.bucketId))),
  ])
}
