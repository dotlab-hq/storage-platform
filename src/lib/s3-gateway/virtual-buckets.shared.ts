import { createHmac } from 'node:crypto'
import { db } from '@/db'
import { virtualBucket } from '@/db/schema/s3-gateway'
import { user } from '@/db/schema/auth-schema'
import type { S3BucketCredentials, S3BucketItem } from '@/types/s3-buckets'
import { and, eq } from 'drizzle-orm'

/**
 * Resolve the name of the user's default assets bucket. Stored on the user
 * row at bucket-creation time. Bucket names are globally unique, so this
 * returns the per-user-suffixed name (e.g. "assets-abcde").
 */
export async function getUserDefaultAssetsBucketName(
  userId: string,
): Promise<string | null> {
  try {
    const rows = await db
      .select({ name: user.defaultAssetsBucketName })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)
    return rows[0]?.name ?? null
  } catch {
    // Column may not exist if migration 0034 hasn't run yet
    return null
  }
}

export async function toBucketItem(
  row: {
    id: string
    name: string
    mappedFolderId: string | null
    isActive: boolean
    createdAt: Date
  },
  defaultAssetsBucketName: string | null,
): Promise<S3BucketItem> {
  return {
    id: row.id,
    name: row.name,
    mappedFolderId: row.mappedFolderId,
    isActive: row.isActive,
    isDefault:
      defaultAssetsBucketName !== null &&
      defaultAssetsBucketName === row.name,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function getActiveBucketRow( userId: string, bucketName: string ) {
  const rows = await db
    .select( {
      userId: virtualBucket.userId,
      id: virtualBucket.id,
      name: virtualBucket.name,
      mappedFolderId: virtualBucket.mappedFolderId,
      isActive: virtualBucket.isActive,
      credentialVersion: virtualBucket.credentialVersion,
      region: virtualBucket.region,
      blockPublicAccess: virtualBucket.blockPublicAccess,
      createdAt: virtualBucket.createdAt,
    } )
    .from( virtualBucket )
    .where(
      and(
        eq( virtualBucket.userId, userId ),
        eq( virtualBucket.name, bucketName ),
        eq( virtualBucket.isActive, true ),
      ),
    )
    .limit( 1 )

  return rows[0] ?? null
}

/**
 * Throws if the (userId, bucketName) row is the user's default assets bucket.
 * Since bucket names are globally unique, we compare against the name stored
 * on the user row, not against a hard-coded literal.
 */
export async function assertMutableBucket(
  userId: string,
  bucketName: string,
): Promise<void> {
  const defaultName = await getUserDefaultAssetsBucketName(userId)
  if (defaultName !== null && defaultName === bucketName) {
    throw new Error(
      `Bucket "${defaultName}" is reserved for attachments and cannot be deleted or emptied.`,
    )
  }
}

function resolveCredentialSecret(): string {
  const secret =
    process.env.S3_GATEWAY_CREDENTIAL_SECRET ?? process.env.BETTER_AUTH_SECRET
  if ( !secret ) {
    throw new Error( 'Missing credential signing secret' )
  }
  return secret
}

function normalizeEndpoint( rawEndpoint: string ): string {
  const trimmed = rawEndpoint.trim()
  if ( trimmed.length === 0 ) {
    throw new Error( 'S3 compatibility endpoint is empty' )
  }

  const withoutTrailingSlash = trimmed.endsWith( '/' )
    ? trimmed.slice( 0, -1 )
    : trimmed

  if ( withoutTrailingSlash.endsWith( '/api/storage/s3' ) ) {
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
  return normalizeEndpoint( candidate )
}

function resolveCompatRegion(): string {
  // Return a real region for SigV4 compatibility. 'auto' causes signing
  // failures with many S3-compatible providers.
  const envRegion = process.env.S3_TEST_REGION ?? process.env.S3_REGION
  if (envRegion) {
    const trimmed = envRegion.trim().toLowerCase()
    if (trimmed.length > 0 && trimmed !== 'auto' && trimmed !== 'null' && trimmed !== 'undefined') {
      return envRegion.trim()
    }
  }
  return 'us-east-1'
}

export function createBucketCredentials(
  userId: string,
  bucketId: string,
  bucketName: string,
  credentialVersion: number,
  region?: string,
): S3BucketCredentials {
  const digest = createHmac( 'sha256', resolveCredentialSecret() )
    .update( `${userId}:${bucketId}:${bucketName}:${credentialVersion}` )
    .digest( 'hex' )
  const compactBucketId = bucketId.replaceAll( '-', '' ).slice( 0, 20 )

  // Always ensure region is non-empty: use provided (trimmed), else fallback
  // Handle null, undefined, empty string, and whitespace
  const trimmedRegion = region ? region.trim() : ''
  const effectiveRegion = trimmedRegion.length > 0 ? trimmedRegion : resolveCompatRegion()

  if ( !effectiveRegion || effectiveRegion.trim().length === 0 ) {
    throw new Error(
      `Failed to resolve S3 region for bucket "${bucketName}". ` +
      `Provided region: "${region}", Resolved to: "${effectiveRegion}". ` +
      `This indicates a critical configuration issue.`,
    )
  }

  return {
    accessKeyId: `sp_${compactBucketId}`,
    secretAccessKey: `${digest}${digest.slice( 0, 24 )}`,
    bucket: bucketName,
    endpoint: resolveCompatEndpoint(),
    region: effectiveRegion,
  }
}
