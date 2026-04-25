import { createHmac } from 'node:crypto'
import { db } from '@/db'
import { virtualBucket } from '@/db/schema/s3-gateway'
import type { S3BucketCredentials, S3BucketItem } from '@/types/s3-buckets'
import { and, eq } from 'drizzle-orm'
import {
  DEFAULT_ASSETS_BUCKET_NAME,
  isDefaultAssetsBucketName,
} from '@/lib/storage/assets-bucket'

export function toBucketItem(row: {
  id: string
  name: string
  mappedFolderId: string | null
  isActive: boolean
  createdAt: Date
}): S3BucketItem {
  return {
    id: row.id,
    name: row.name,
    mappedFolderId: row.mappedFolderId,
    isActive: row.isActive,
    isDefault: isDefaultAssetsBucketName(row.name),
    createdAt: row.createdAt.toISOString(),
  }
}

export async function getActiveBucketRow(userId: string, bucketName: string) {
  const rows = await db
    .select({
      id: virtualBucket.id,
      name: virtualBucket.name,
      mappedFolderId: virtualBucket.mappedFolderId,
      isActive: virtualBucket.isActive,
      credentialVersion: virtualBucket.credentialVersion,
    })
    .from(virtualBucket)
    .where(
      and(
        eq(virtualBucket.userId, userId),
        eq(virtualBucket.name, bucketName),
        eq(virtualBucket.isActive, true),
      ),
    )
    .limit(1)

  return rows[0] ?? null
}

export function assertMutableBucket(bucketName: string): void {
  if (isDefaultAssetsBucketName(bucketName)) {
    throw new Error(
      `Bucket "${DEFAULT_ASSETS_BUCKET_NAME}" is reserved for attachments and cannot be deleted or emptied.`,
    )
  }
}

function resolveCredentialSecret(): string {
  const secret =
    process.env.S3_GATEWAY_CREDENTIAL_SECRET ?? process.env.BETTER_AUTH_SECRET
  if (!secret) {
    throw new Error('Missing credential signing secret')
  }
  return secret
}

function normalizeEndpoint(rawEndpoint: string): string {
  const trimmed = rawEndpoint.trim()
  if (trimmed.length === 0) {
    throw new Error('S3 compatibility endpoint is empty')
  }

  const withoutTrailingSlash = trimmed.endsWith('/')
    ? trimmed.slice(0, -1)
    : trimmed

  if (withoutTrailingSlash.endsWith('/api/storage/s3')) {
    throw new Error(
      'S3_COMPAT_ENDPOINT must be the S3 root endpoint, not /api/storage/s3',
    )
  }

  return withoutTrailingSlash
}

function resolveCompatEndpoint(): string {
  const candidate =
    process.env.S3_COMPAT_ENDPOINT ??
    process.env.PUBLIC_S3_COMPAT_ENDPOINT ??
    'https://storage.wpsadi.dev'
  return normalizeEndpoint(candidate)
}

function resolveCompatRegion(): string {
  const region = process.env.S3_COMPAT_REGION?.trim()
  if (region && region.length > 0) {
    return region
  }
  return 'us-east-1'
}

export function createBucketCredentials(
  userId: string,
  bucketId: string,
  bucketName: string,
  credentialVersion: number,
): S3BucketCredentials {
  const digest = createHmac('sha256', resolveCredentialSecret())
    .update(`${userId}:${bucketId}:${bucketName}:${credentialVersion}`)
    .digest('hex')
  const compactBucketId = bucketId.replaceAll('-', '').slice(0, 20)

  return {
    accessKeyId: `sp_${compactBucketId}`,
    secretAccessKey: `${digest}${digest.slice(0, 24)}`,
    bucket: bucketName,
    endpoint: resolveCompatEndpoint(),
    region: resolveCompatRegion(),
  }
}
