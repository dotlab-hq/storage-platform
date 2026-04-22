import { createHash } from 'node:crypto'
import { db } from '@/db'
import { bucketCorsRule, bucketPolicy } from '@/db/schema/s3-controls'
import {
  multipartUploadPart,
  uploadAttempt,
  virtualBucket,
} from '@/db/schema/s3-gateway'
import type { BucketContext } from '@/lib/s3-gateway/s3-context'
import { and, asc, eq } from 'drizzle-orm'

export type BucketCorsRuleRecord = {
  allowedOrigins: string[]
  allowedMethods: string[]
  allowedHeaders: string[]
  exposeHeaders: string[]
  maxAgeSeconds: number | null
}

export type MultipartUploadListItem = {
  uploadId: string
  key: string
  initiated: Date
}

export type MultipartPartListItem = {
  partNumber: number
  etag: string | null
  size: number
  lastModified: Date
}

function etagFor(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

export async function getBucketLocation(bucketId: string): Promise<string> {
  const rows = await db
    .select({ region: virtualBucket.region })
    .from(virtualBucket)
    .where(eq(virtualBucket.id, bucketId))
    .limit(1)
  return rows[0]?.region ?? 'us-east-1'
}

export async function getBucketVersioning(bucketId: string): Promise<string> {
  const rows = await db
    .select({ versioningState: virtualBucket.versioningState })
    .from(virtualBucket)
    .where(eq(virtualBucket.id, bucketId))
    .limit(1)
  return rows[0]?.versioningState ?? 'disabled'
}

export async function setBucketVersioning(
  bucketId: string,
  versioningState: string,
): Promise<void> {
  await db
    .update(virtualBucket)
    .set({ versioningState })
    .where(eq(virtualBucket.id, bucketId))
}

export async function getBucketPolicy(
  bucketId: string,
): Promise<{ policyJson: string; etag: string | null } | null> {
  const rows = await db
    .select({ policyJson: bucketPolicy.policyJson, etag: bucketPolicy.etag })
    .from(bucketPolicy)
    .where(eq(bucketPolicy.bucketId, bucketId))
    .limit(1)
  return rows[0] ?? null
}

export async function putBucketPolicy(
  bucketId: string,
  policyJson: string,
): Promise<string> {
  const etag = etagFor(policyJson)
  await db
    .insert(bucketPolicy)
    .values({
      bucketId,
      policyJson,
      etag,
    })
    .onConflictDoUpdate({
      target: bucketPolicy.bucketId,
      set: {
        policyJson,
        etag,
      },
    })
  return etag
}

export async function deleteBucketPolicy(bucketId: string): Promise<void> {
  await db.delete(bucketPolicy).where(eq(bucketPolicy.bucketId, bucketId))
}

export async function getBucketCors(
  bucketId: string,
): Promise<BucketCorsRuleRecord[]> {
  const rows = await db
    .select({
      allowedOriginsJson: bucketCorsRule.allowedOriginsJson,
      allowedMethodsJson: bucketCorsRule.allowedMethodsJson,
      allowedHeadersJson: bucketCorsRule.allowedHeadersJson,
      exposeHeadersJson: bucketCorsRule.exposeHeadersJson,
      maxAgeSeconds: bucketCorsRule.maxAgeSeconds,
    })
    .from(bucketCorsRule)
    .where(eq(bucketCorsRule.bucketId, bucketId))
    .orderBy(asc(bucketCorsRule.ruleOrder))

  return rows.map((row) => ({
    allowedOrigins: JSON.parse(row.allowedOriginsJson) as string[],
    allowedMethods: JSON.parse(row.allowedMethodsJson) as string[],
    allowedHeaders: row.allowedHeadersJson
      ? (JSON.parse(row.allowedHeadersJson) as string[])
      : [],
    exposeHeaders: row.exposeHeadersJson
      ? (JSON.parse(row.exposeHeadersJson) as string[])
      : [],
    maxAgeSeconds: row.maxAgeSeconds,
  }))
}

export async function replaceBucketCors(
  bucketId: string,
  rules: BucketCorsRuleRecord[],
): Promise<void> {
  await db.delete(bucketCorsRule).where(eq(bucketCorsRule.bucketId, bucketId))
  if (rules.length === 0) {
    return
  }

  await db
    .insert(bucketCorsRule)
    .values(
      rules.map((rule, index) => ({
        bucketId,
        ruleOrder: index,
        allowedOriginsJson: JSON.stringify(rule.allowedOrigins),
        allowedMethodsJson: JSON.stringify(rule.allowedMethods),
        allowedHeadersJson: JSON.stringify(rule.allowedHeaders),
        exposeHeadersJson: JSON.stringify(rule.exposeHeaders),
        maxAgeSeconds: rule.maxAgeSeconds,
      })),
    )
    .onConflictDoNothing()
}

export async function listMultipartUploads(
  bucket: BucketContext,
): Promise<MultipartUploadListItem[]> {
  const rows = await db
    .select({
      uploadId: uploadAttempt.uploadId,
      internalId: uploadAttempt.id,
      key: uploadAttempt.objectKey,
      initiated: uploadAttempt.createdAt,
    })
    .from(uploadAttempt)
    .where(
      and(
        eq(uploadAttempt.bucketId, bucket.bucketId),
        eq(uploadAttempt.userId, bucket.userId),
        eq(uploadAttempt.status, 'pending'),
      ),
    )
    .orderBy(asc(uploadAttempt.createdAt))

  return rows.map((row) => ({
    uploadId: row.uploadId ?? row.internalId,
    key: row.key,
    initiated: row.initiated,
  }))
}

export async function listMultipartParts(
  bucket: BucketContext,
  uploadId: string,
): Promise<MultipartPartListItem[]> {
  const uploads = await db
    .select({ id: uploadAttempt.id })
    .from(uploadAttempt)
    .where(
      and(
        eq(uploadAttempt.id, uploadId),
        eq(uploadAttempt.bucketId, bucket.bucketId),
        eq(uploadAttempt.userId, bucket.userId),
      ),
    )
    .limit(1)

  if (!uploads[0]) {
    throw new Error('Invalid or expired upload ID')
  }

  const rows = await db
    .select({
      partNumber: multipartUploadPart.partNumber,
      etag: multipartUploadPart.etag,
      size: multipartUploadPart.sizeInBytes,
      lastModified: multipartUploadPart.createdAt,
    })
    .from(multipartUploadPart)
    .where(eq(multipartUploadPart.uploadAttemptId, uploads[0].id))
    .orderBy(asc(multipartUploadPart.partNumber))

  return rows
}
