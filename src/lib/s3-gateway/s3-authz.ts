import type { BucketContext } from '@/lib/s3-gateway/s3-context'
import { accessKeyIdForBucket } from '@/lib/s3-gateway/s3-context'
import { evaluateBucketPolicy } from '@/lib/s3-gateway/s3-policy'
import {
  isBucketPublicReadable,
  isObjectPublicReadable,
} from '@/lib/s3-gateway/s3-acl'

export type S3Action =
  | 's3:ListBucket'
  | 's3:GetObject'
  | 's3:PutObject'
  | 's3:DeleteObject'
  | 's3:GetBucketAcl'
  | 's3:PutBucketAcl'
  | 's3:GetBucketPolicy'
  | 's3:PutBucketPolicy'

function bucketArn(bucketName: string): string {
  return `arn:aws:s3:::${bucketName}`
}

function objectArn(bucketName: string, objectKey: string): string {
  return `arn:aws:s3:::${bucketName}/${objectKey}`
}

export async function isActionAllowed(input: {
  bucket: BucketContext
  action: S3Action
  accessKeyId: string | null
  objectKey: string | null
}): Promise<boolean> {
  const ownerAccessKey = accessKeyIdForBucket(input.bucket.bucketId)
  const isOwner = input.accessKeyId === ownerAccessKey
  const resource = input.objectKey
    ? objectArn(input.bucket.bucketName, input.objectKey)
    : bucketArn(input.bucket.bucketName)

  const policyDecision = await evaluateBucketPolicy(
    input.bucket.bucketId,
    input.accessKeyId,
    input.action,
    resource,
  )
  if (policyDecision === 'deny') {
    return false
  }
  if (policyDecision === 'allow') {
    return true
  }

  if (isOwner) {
    return true
  }

  if (input.action === 's3:ListBucket') {
    if (input.bucket.blockPublicAccess) {
      return false
    }
    return isBucketPublicReadable(input.bucket.bucketId)
  }

  if (input.action === 's3:GetObject' && input.objectKey) {
    const objectPublic = await isObjectPublicReadable(
      input.bucket,
      input.objectKey,
    )
    if (objectPublic && !input.bucket.blockPublicAccess) {
      return true
    }
    if (input.bucket.blockPublicAccess) {
      return false
    }
    return isBucketPublicReadable(input.bucket.bucketId)
  }

  return false
}
