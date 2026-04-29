import { copyObject, putObject } from '@/lib/s3-gateway/s3-object-store'
import {
  createObjectVersionFromCurrent,
  getBucketVersioningState,
  getResponseVersionIdForCurrentObject,
} from '@/lib/s3-gateway/s3-versioning'
import { createVirtualBucket } from '@/lib/s3-gateway/virtual-buckets.server'
import {
  parseAccessKeyId,
  resolveBucketByAccessKey,
  resolveBucketByName,
} from '@/lib/s3-gateway/s3-context'
import {
  ensureAccess,
  parseContentLength,
  resolveAuthorizedBucket,
} from '@/lib/s3-gateway/s3-dispatch-context'
import {
  multipartPartNumber,
  multipartUploadId,
  parseCopySource,
} from '@/lib/s3-gateway/s3-request'
import { uploadPart } from '@/lib/s3-gateway/s3-multipart'
import {
  parseBucketCorsXml,
  parseVersioningState,
} from '@/lib/s3-gateway/s3-control-xml'
import { putBucketAcl, putObjectAcl } from '@/lib/s3-gateway/s3-acl'
import {
  putBucketPolicy,
  replaceBucketCors,
  setBucketVersioning,
} from '@/lib/s3-gateway/s3-bucket-controls'
import {
  parseObjectTaggingXml,
  replaceObjectTags,
} from '@/lib/s3-gateway/s3-object-tagging'
import {
  copyObjectXml,
  s3ErrorResponse,
  xmlResponse,
} from '@/lib/s3-gateway/s3-xml'
import { persistSseMetadata } from '@/lib/s3-gateway/s3-encryption'

type PutObjectRequestMetadata = {
  cacheControl: string | null
  contentDisposition: string | null
  contentEncoding: string | null
  contentLanguage: string | null
  metadata: Record<string, string>
}

function readPutObjectRequestMetadata(
  request: Request,
): PutObjectRequestMetadata {
  const metadata: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase()
    if (!lower.startsWith('x-amz-meta-')) return
    const metadataKey = lower.slice('x-amz-meta-'.length)
    if (metadataKey.length === 0) return
    metadata[metadataKey] = value
  })

  return {
    cacheControl: request.headers.get('cache-control'),
    contentDisposition: request.headers.get('content-disposition'),
    contentEncoding: request.headers.get('content-encoding'),
    contentLanguage: request.headers.get('content-language'),
    metadata,
  }
}

export async function handlePut(
  request: Request,
  parsed: { bucketName: string | null; objectKey: string | null },
): Promise<Response> {
  if (!parsed.bucketName)
    return s3ErrorResponse(400, 'InvalidRequest', 'Bucket is required', '/')

  const accessKeyId = parseAccessKeyId(request)
  const ownerBucket = accessKeyId
    ? await resolveBucketByAccessKey(accessKeyId)
    : null

  if (!parsed.objectKey) {
    if (!ownerBucket)
      return s3ErrorResponse(
        403,
        'AccessDenied',
        'Access denied',
        `/${parsed.bucketName}`,
      )
    const url = new URL(request.url)
    if (url.searchParams.has('versioning')) {
      const targetBucket = await resolveBucketByName(parsed.bucketName)
      if (!targetBucket || targetBucket.userId !== ownerBucket.userId)
        return s3ErrorResponse(
          403,
          'AccessDenied',
          'Access denied',
          `/${parsed.bucketName}`,
        )
      await setBucketVersioning(
        targetBucket.bucketId,
        parseVersioningState(await request.text()),
      )
      return new Response(null, { status: 200 })
    }
    if (url.searchParams.has('acl')) {
      const targetBucket = await resolveBucketByName(parsed.bucketName)
      if (!targetBucket)
        return s3ErrorResponse(
          404,
          'NoSuchBucket',
          'The specified bucket does not exist',
          `/${parsed.bucketName}`,
        )
      if (!(await ensureAccess(targetBucket, request, 's3:PutBucketAcl', null)))
        return s3ErrorResponse(
          403,
          'AccessDenied',
          'Access denied',
          `/${parsed.bucketName}`,
        )
      await putBucketAcl(targetBucket, request.headers)
      return new Response(null, { status: 200 })
    }
    if (url.searchParams.has('policy')) {
      const targetBucket = await resolveBucketByName(parsed.bucketName)
      if (!targetBucket || targetBucket.userId !== ownerBucket.userId)
        return s3ErrorResponse(
          403,
          'AccessDenied',
          'Access denied',
          `/${parsed.bucketName}`,
        )
      await putBucketPolicy(targetBucket.bucketId, await request.text())
      return new Response(null, { status: 204 })
    }
    if (url.searchParams.has('cors')) {
      const targetBucket = await resolveBucketByName(parsed.bucketName)
      if (!targetBucket || targetBucket.userId !== ownerBucket.userId)
        return s3ErrorResponse(
          403,
          'AccessDenied',
          'Access denied',
          `/${parsed.bucketName}`,
        )
      await replaceBucketCors(
        targetBucket.bucketId,
        parseBucketCorsXml(await request.text()),
      )
      return new Response(null, { status: 200 })
    }

    const existingBucket = await resolveBucketByName(parsed.bucketName)
    if (existingBucket) {
      if (existingBucket.userId === ownerBucket.userId)
        return s3ErrorResponse(
          409,
          'BucketAlreadyOwnedByYou',
          'Your previous request to create the named bucket succeeded and you already own it.',
          `/${parsed.bucketName}`,
        )
      return s3ErrorResponse(
        409,
        'BucketAlreadyExists',
        'The requested bucket name is not available.',
        `/${parsed.bucketName}`,
      )
    }
    await createVirtualBucket(ownerBucket.userId, parsed.bucketName)
    return new Response(null, { status: 200 })
  }

  const bucket = await resolveAuthorizedBucket(request, parsed.bucketName)
  if (!bucket)
    return s3ErrorResponse(
      403,
      'AccessDenied',
      'Access denied',
      `/${parsed.bucketName}/${parsed.objectKey}`,
    )

  const query = new URL(request.url).searchParams
  if (query.has('acl')) {
    if (
      !(await ensureAccess(bucket, request, 's3:PutObject', parsed.objectKey))
    )
      return s3ErrorResponse(
        403,
        'AccessDenied',
        'Access denied',
        `/${bucket.bucketName}/${parsed.objectKey}`,
      )
    await putObjectAcl(bucket, parsed.objectKey, request.headers)
    return new Response(null, { status: 200 })
  }
  if (query.has('tagging')) {
    await replaceObjectTags(
      bucket,
      parsed.objectKey,
      parseObjectTaggingXml(await request.text()),
    )
    return new Response(null, { status: 200 })
  }

  const copySourceHeader = request.headers.get('x-amz-copy-source')
  if (copySourceHeader) {
    const parsedCopySource = parseCopySource(copySourceHeader)
    if (!parsedCopySource)
      return s3ErrorResponse(
        400,
        'InvalidRequest',
        'x-amz-copy-source must be in the format /bucket/key',
        `/${parsed.bucketName}/${parsed.objectKey}`,
      )
    const sourceBucket = await resolveAuthorizedBucket(
      request,
      parsedCopySource.bucketName,
    )
    if (!sourceBucket)
      return s3ErrorResponse(
        403,
        'AccessDenied',
        'Access denied to source bucket',
        `/${parsedCopySource.bucketName}/${parsedCopySource.objectKey}`,
      )
    const copied = await copyObject(
      sourceBucket,
      parsedCopySource.objectKey,
      bucket,
      parsed.objectKey,
    )
    const copyVersioningState = await getBucketVersioningState(bucket.bucketId)
    let copyVersionId: string | null = null
    if (copyVersioningState === 'enabled') {
      copyVersionId = await createObjectVersionFromCurrent(
        bucket,
        parsed.objectKey,
      )
    }
    if (copyVersioningState === 'suspended') {
      copyVersionId = await createObjectVersionFromCurrent(
        bucket,
        parsed.objectKey,
        'null',
      )
    }
    return xmlResponse(
      copyObjectXml(copied.eTag ?? '', copied.lastModified, copyVersionId),
      200,
      {
        ...(copyVersionId ? { 'x-amz-version-id': copyVersionId } : {}),
      },
    )
  }

  if (!request.body)
    return s3ErrorResponse(
      400,
      'InvalidRequest',
      'Request body stream is required',
      `/${parsed.bucketName}/${parsed.objectKey}`,
    )
  const uploadId = multipartUploadId(request.url)
  const partNumber = multipartPartNumber(request.url)
  if (
    (uploadId !== null || partNumber !== null) &&
    (uploadId === null || partNumber === null)
  ) {
    return s3ErrorResponse(
      400,
      'InvalidRequest',
      'Both uploadId and partNumber are required for multipart part upload',
      `/${parsed.bucketName}/${parsed.objectKey}`,
    )
  }

  const requestMetadata = readPutObjectRequestMetadata(request)

  const eTag =
    uploadId && partNumber
      ? await uploadPart(
          bucket,
          parsed.objectKey,
          uploadId,
          partNumber,
          request.body,
          request.headers.get('content-type'),
          parseContentLength(request),
        )
      : await putObject(
          bucket,
          parsed.objectKey,
          request.body,
          request.headers.get('content-type'),
          parseContentLength(request),
          requestMetadata,
        )

  const versioningState = await getBucketVersioningState(bucket.bucketId)
  let responseVersionId: string | null = null
  if (versioningState === 'enabled') {
    responseVersionId = await createObjectVersionFromCurrent(
      bucket,
      parsed.objectKey,
    )
  }
  if (versioningState === 'suspended') {
    responseVersionId = await createObjectVersionFromCurrent(
      bucket,
      parsed.objectKey,
      'null',
    )
  }
  if (!responseVersionId && versioningState !== 'disabled') {
    responseVersionId = await getResponseVersionIdForCurrentObject(
      bucket,
      parsed.objectKey,
    )
  }
  await persistSseMetadata(
    bucket,
    parsed.objectKey,
    request.headers.get('x-amz-server-side-encryption'),
  )
  const headers = new Headers()
  if (responseVersionId) {
    headers.set('x-amz-version-id', responseVersionId)
  }
  return new Response(null, { status: 200, headers })
}
