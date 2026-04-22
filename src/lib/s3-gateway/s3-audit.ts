import { db } from '@/db'
import { s3RequestAudit } from '@/db/schema/s3-security'

type AuditInput = {
  requestId: string
  userId: string | null
  accessKeyId: string | null
  bucketName: string
  objectKey: string | null
  operation: string
  httpStatus: number
  errorCode: string | null
  durationMs: number
  sourceIp: string | null
  userAgent: string | null
}

export async function recordS3Audit(input: AuditInput): Promise<void> {
  await db.insert(s3RequestAudit).values({
    requestId: input.requestId,
    userId: input.userId,
    accessKeyId: input.accessKeyId,
    bucketName: input.bucketName,
    objectKey: input.objectKey,
    operation: input.operation,
    httpStatus: input.httpStatus,
    errorCode: input.errorCode,
    durationMs: input.durationMs,
    sourceIp: input.sourceIp,
    userAgent: input.userAgent,
  })
}

export function inferS3Operation(request: Request): string {
  const url = new URL(request.url)
  const hasUploads = url.searchParams.has('uploads')
  const uploadId = url.searchParams.has('uploadId')
  const part = url.searchParams.has('partNumber')

  if (request.method === 'GET' && hasUploads) return 'ListMultipartUploads'
  if (request.method === 'GET' && uploadId) return 'ListParts'
  if (request.method === 'POST' && hasUploads) return 'CreateMultipartUpload'
  if (request.method === 'PUT' && uploadId && part) return 'UploadPart'
  if (request.method === 'POST' && uploadId) return 'CompleteMultipartUpload'
  if (request.method === 'DELETE' && uploadId) return 'AbortMultipartUpload'
  if (request.method === 'GET' && url.searchParams.has('versioning'))
    return 'GetBucketVersioning'
  if (request.method === 'PUT' && url.searchParams.has('versioning'))
    return 'PutBucketVersioning'
  if (request.method === 'GET' && url.searchParams.has('versions'))
    return 'ListObjectVersions'
  if (request.method === 'GET' && url.searchParams.has('tagging'))
    return 'GetObjectTagging'
  if (request.method === 'PUT' && url.searchParams.has('tagging'))
    return 'PutObjectTagging'
  if (request.method === 'DELETE' && url.searchParams.has('tagging'))
    return 'DeleteObjectTagging'
  if (request.method === 'GET') return 'GetObjectOrList'
  if (request.method === 'HEAD') return 'HeadObjectOrBucket'
  if (request.method === 'PUT') return 'PutObjectOrBucket'
  if (request.method === 'DELETE') return 'DeleteObjectOrBucket'
  return 'Unknown'
}
