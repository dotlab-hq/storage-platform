import {
  getObject,
  headObject,
  listObjectsV2,
} from '@/lib/s3-gateway/s3-object-store'
import {
  getObjectTags,
  objectTaggingXml,
} from '@/lib/s3-gateway/s3-object-tagging'
import {
  getObjectVersionResponse,
  getResponseVersionIdForCurrentObject,
  listObjectVersions,
} from '@/lib/s3-gateway/s3-versioning'
import { getBucketAclXml, getObjectAclXml } from '@/lib/s3-gateway/s3-acl'
import {
  resolveBucketByAccessKey,
  resolveBucketByName,
  parseAccessKeyId,
} from '@/lib/s3-gateway/s3-context'
import {
  buildCacheHeaders,
  parseHttpDate,
  shouldReturnNotModified,
} from '@/lib/s3-gateway/s3-conditional-cache'
import {
  getBucketCors,
  getBucketLocation,
  getBucketPolicy,
  getBucketVersioning,
  listMultipartParts,
  listMultipartUploads,
} from '@/lib/s3-gateway/s3-bucket-controls'
import {
  bucketCorsXml,
  bucketLocationXml,
  bucketVersioningXml,
  listMultipartUploadsXml,
  listPartsXml,
} from '@/lib/s3-gateway/s3-control-xml'
import { listObjectVersionsXml } from '@/lib/s3-gateway/s3-versioning-xml'
import type { S3ObjectItem } from '@/lib/s3-gateway/s3-xml'
import {
  listBucketsXml,
  listObjectsV2Xml,
  listObjectsXml,
  s3ErrorResponse,
  xmlResponse,
} from '@/lib/s3-gateway/s3-xml'
import { listVirtualBuckets } from '@/lib/s3-gateway/virtual-buckets.server'
import {
  cacheS3ObjectFromStream,
  getCachedS3Object,
  getS3ObjectCacheKey,
  resolveShortObjectCacheControl,
} from '@/lib/s3-gateway/s3-get-object-cache'
import {
  listDelimiter,
  listPrefix,
  listTypeIsV2,
  multipartUploadId,
} from '@/lib/s3-gateway/s3-request'
import {
  ensureAccess,
  resolveAuthorizedBucket,
} from '@/lib/s3-gateway/s3-dispatch-context'

function applyDelimiterProjection(
  items: S3ObjectItem[],
  prefix: string,
  delimiter: string | null,
): { objects: S3ObjectItem[]; commonPrefixes: string[] } {
  if (!delimiter) {
    return { objects: items, commonPrefixes: [] }
  }

  const commonPrefixes = new Set<string>()
  const objects: S3ObjectItem[] = []
  for (const item of items) {
    const relative = item.key.startsWith(prefix)
      ? item.key.slice(prefix.length)
      : item.key
    const boundary = relative.indexOf(delimiter)
    if (boundary === -1) {
      objects.push(item)
      continue
    }
    commonPrefixes.add(
      `${prefix}${relative.slice(0, boundary + delimiter.length)}`,
    )
  }

  return {
    objects,
    commonPrefixes: Array.from(commonPrefixes).sort(),
  }
}

function parsePositiveContentLength(value: string | null): number | null {
  if (!value) return null
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function parseMaxKeys(url: URL): number {
  const value = url.searchParams.get('max-keys')
  if (!value) return 1000
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 1000
  }
  return Math.min(parsed, 1000)
}

function decodeContinuationToken(token: string | null): string | null {
  if (!token) return null
  try {
    return atob(token)
  } catch {
    return token
  }
}

function encodeContinuationToken(value: string | null): string | null {
  if (!value) return null
  return btoa(value)
}

function applyPagination(
  items: S3ObjectItem[],
  commonPrefixes: string[],
  maxKeys: number,
  startAfterKey: string | null,
): {
  objects: S3ObjectItem[]
  commonPrefixes: string[]
  isTruncated: boolean
  nextToken: string | null
  nextMarker: string | null
} {
  const combined: Array<
    | { type: 'object'; key: string; value: S3ObjectItem }
    | { type: 'prefix'; key: string; value: string }
  > = [
    ...items.map((item) => ({
      type: 'object' as const,
      key: item.key,
      value: item,
    })),
    ...commonPrefixes.map((prefix) => ({
      type: 'prefix' as const,
      key: prefix,
      value: prefix,
    })),
  ].sort((left, right) => left.key.localeCompare(right.key))

  const filtered = startAfterKey
    ? combined.filter((entry) => entry.key > startAfterKey)
    : combined

  if (maxKeys === 0) {
    return {
      objects: [],
      commonPrefixes: [],
      isTruncated: filtered.length > 0,
      nextToken:
        filtered.length > 0 ? encodeContinuationToken(filtered[0].key) : null,
      nextMarker: filtered.length > 0 ? filtered[0].key : null,
    }
  }

  const page = filtered.slice(0, maxKeys)
  const remaining = filtered.slice(maxKeys)
  const pagedObjects = page
    .filter(
      (entry): entry is { type: 'object'; key: string; value: S3ObjectItem } =>
        entry.type === 'object',
    )
    .map((entry) => entry.value)
  const pagedPrefixes = page
    .filter(
      (entry): entry is { type: 'prefix'; key: string; value: string } =>
        entry.type === 'prefix',
    )
    .map((entry) => entry.value)
  const nextKey = remaining[0]?.key ?? null

  return {
    objects: pagedObjects,
    commonPrefixes: pagedPrefixes,
    isTruncated: remaining.length > 0,
    nextToken: encodeContinuationToken(nextKey),
    nextMarker: nextKey,
  }
}

export async function handleGet(
  request: Request,
  parsed: { bucketName: string | null; objectKey: string | null },
): Promise<Response> {
  if (!parsed.bucketName) {
    const accessKeyId = parseAccessKeyId(request)
    if (!accessKeyId)
      return s3ErrorResponse(403, 'AccessDenied', 'Missing credentials', '/')
    const bucket = await resolveBucketByAccessKey(accessKeyId)
    if (!bucket)
      return s3ErrorResponse(403, 'AccessDenied', 'Invalid credentials', '/')
    const buckets = await listVirtualBuckets(bucket.userId)
    return xmlResponse(
      listBucketsXml(
        buckets.map((item) => ({
          name: item.name,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        })),
      ),
    )
  }

  const bucket = await resolveAuthorizedBucket(request, parsed.bucketName)
  if (!bucket) {
    const byName = await resolveBucketByName(parsed.bucketName)
    if (!byName)
      return s3ErrorResponse(
        404,
        'NoSuchBucket',
        'The specified bucket does not exist',
        `/${parsed.bucketName}`,
      )
    const allowedAnon = await ensureAccess(
      byName,
      request,
      parsed.objectKey ? 's3:GetObject' : 's3:ListBucket',
      parsed.objectKey,
    )
    if (!allowedAnon)
      return s3ErrorResponse(
        403,
        'AccessDenied',
        'Access denied',
        `/${parsed.bucketName}`,
      )
  }
  const resolvedBucket =
    bucket ?? (await resolveBucketByName(parsed.bucketName))
  if (!resolvedBucket)
    return s3ErrorResponse(
      404,
      'NoSuchBucket',
      'The specified bucket does not exist',
      `/${parsed.bucketName}`,
    )

  if (!parsed.objectKey) {
    const url = new URL(request.url)
    const allowBucket = await ensureAccess(
      resolvedBucket,
      request,
      's3:ListBucket',
      null,
    )
    if (!allowBucket)
      return s3ErrorResponse(
        403,
        'AccessDenied',
        'Access denied',
        `/${resolvedBucket.bucketName}`,
      )
    if (url.searchParams.has('location'))
      return xmlResponse(
        bucketLocationXml(await getBucketLocation(resolvedBucket.bucketId)),
      )
    if (url.searchParams.has('versioning'))
      return xmlResponse(
        bucketVersioningXml(await getBucketVersioning(resolvedBucket.bucketId)),
      )
    if (url.searchParams.has('acl'))
      return xmlResponse(await getBucketAclXml(resolvedBucket))
    if (url.searchParams.has('policy')) {
      const policy = await getBucketPolicy(resolvedBucket.bucketId)
      if (!policy)
        return s3ErrorResponse(
          404,
          'NoSuchBucketPolicy',
          'The bucket policy does not exist',
          `/${resolvedBucket.bucketName}`,
        )
      return new Response(policy.policyJson, {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    if (url.searchParams.has('cors')) {
      const rules = await getBucketCors(resolvedBucket.bucketId)
      if (rules.length === 0)
        return s3ErrorResponse(
          404,
          'NoSuchCORSConfiguration',
          'The CORS configuration does not exist',
          `/${resolvedBucket.bucketName}`,
        )
      return xmlResponse(bucketCorsXml(rules))
    }
    if (url.searchParams.has('uploads'))
      return xmlResponse(
        listMultipartUploadsXml(
          resolvedBucket.bucketName,
          await listMultipartUploads(resolvedBucket),
        ),
      )
    if (url.searchParams.has('versions'))
      return xmlResponse(
        listObjectVersionsXml(
          resolvedBucket.bucketName,
          await listObjectVersions(resolvedBucket.bucketId, {
            prefix: url.searchParams.get('prefix') ?? '',
            keyMarker: url.searchParams.get('key-marker'),
            versionIdMarker: url.searchParams.get('version-id-marker'),
            maxKeys: parseMaxKeys(url),
          }),
        ),
      )
    const prefix = listPrefix(request.url)
    const delimiter = listDelimiter(request.url)
    const objects = await listObjectsV2(resolvedBucket, prefix)
    const projected = applyDelimiterProjection(objects, prefix, delimiter)
    const paginationToken =
      decodeContinuationToken(url.searchParams.get('continuation-token')) ??
      url.searchParams.get('start-after') ??
      url.searchParams.get('marker')
    const paged = applyPagination(
      projected.objects,
      projected.commonPrefixes,
      parseMaxKeys(url),
      paginationToken,
    )
    if (!listTypeIsV2(request.url)) {
      const marker = url.searchParams.get('marker') ?? ''
      return xmlResponse(
        listObjectsXml(
          resolvedBucket.bucketName,
          prefix,
          marker,
          paged.objects,
          {
            delimiter,
            commonPrefixes: paged.commonPrefixes,
            maxKeys: parseMaxKeys(url),
            isTruncated: paged.isTruncated,
            nextMarker: paged.nextMarker,
          },
        ),
      )
    }
    return xmlResponse(
      listObjectsV2Xml(resolvedBucket.bucketName, prefix, paged.objects, {
        delimiter,
        commonPrefixes: paged.commonPrefixes,
        maxKeys: parseMaxKeys(url),
        isTruncated: paged.isTruncated,
        nextContinuationToken: paged.nextToken,
      }),
    )
  }

  if (multipartUploadId(request.url)) {
    const uploadId = multipartUploadId(request.url)
    if (!uploadId)
      return s3ErrorResponse(
        400,
        'InvalidRequest',
        'Missing uploadId',
        `/${resolvedBucket.bucketName}/${parsed.objectKey}`,
      )
    const allowed = await ensureAccess(
      resolvedBucket,
      request,
      's3:GetObject',
      parsed.objectKey,
    )
    if (!allowed)
      return s3ErrorResponse(
        403,
        'AccessDenied',
        'Access denied',
        `/${resolvedBucket.bucketName}/${parsed.objectKey}`,
      )
    return xmlResponse(
      listPartsXml(
        resolvedBucket.bucketName,
        parsed.objectKey,
        uploadId,
        await listMultipartParts(resolvedBucket, uploadId),
      ),
    )
  }

  const query = new URL(request.url).searchParams
  if (query.has('tagging'))
    return xmlResponse(
      objectTaggingXml(await getObjectTags(resolvedBucket, parsed.objectKey)),
    )
  if (query.has('acl'))
    return xmlResponse(await getObjectAclXml(resolvedBucket, parsed.objectKey))

  const versionId = query.get('versionId')
  if (versionId) {
    const versioned = await getObjectVersionResponse(
      resolvedBucket,
      parsed.objectKey,
      versionId,
      false,
    )
    if (!versioned)
      return s3ErrorResponse(
        404,
        'NoSuchVersion',
        'The specified version does not exist',
        `/${resolvedBucket.bucketName}/${parsed.objectKey}`,
      )
    return versioned
  }

  const allowed = await ensureAccess(
    resolvedBucket,
    request,
    's3:GetObject',
    parsed.objectKey,
  )
  if (!allowed)
    return s3ErrorResponse(
      403,
      'AccessDenied',
      'Access denied',
      `/${resolvedBucket.bucketName}/${parsed.objectKey}`,
    )

  const cacheKey = getS3ObjectCacheKey(
    resolvedBucket.bucketId,
    parsed.objectKey,
  )
  const cached = getCachedS3Object(cacheKey)
  if (cached) {
    const notModified = shouldReturnNotModified({
      eTag: cached.eTag,
      lastModified: cached.lastModified,
      ifNoneMatch: request.headers.get('if-none-match'),
      ifModifiedSince: request.headers.get('if-modified-since'),
    })
    if (notModified) {
      return new Response(null, {
        status: 304,
        headers: buildCacheHeaders({
          eTag: cached.eTag,
          lastModified: cached.lastModified ?? undefined,
          cacheControl: cached.cacheControl,
          includeDefaultCacheControl: false,
        }),
      })
    }

    const cachedHeaders = buildCacheHeaders({
      eTag: cached.eTag,
      lastModified: cached.lastModified ?? undefined,
      cacheControl: cached.cacheControl,
      includeDefaultCacheControl: false,
    })
    const responseVersionId = await getResponseVersionIdForCurrentObject(
      resolvedBucket,
      parsed.objectKey,
    )
    if (responseVersionId) {
      cachedHeaders.set('x-amz-version-id', responseVersionId)
    }
    cachedHeaders.set('Content-Type', cached.contentType)
    cachedHeaders.set('Content-Length', String(cached.contentLength))
    const queryResponseType = query.get('response-content-type')
    if (queryResponseType) {
      cachedHeaders.set('Content-Type', queryResponseType)
    }
    const queryDisposition = query.get('response-content-disposition')
    if (queryDisposition) {
      cachedHeaders.set('Content-Disposition', queryDisposition)
    }
    return new Response(new Uint8Array(cached.body), {
      status: 200,
      headers: cachedHeaders,
    })
  }

  const object = await getObject(resolvedBucket, parsed.objectKey, {
    ifNoneMatch: request.headers.get('if-none-match'),
    ifModifiedSince: request.headers.get('if-modified-since'),
  })
  if (!object)
    return s3ErrorResponse(
      404,
      'NoSuchKey',
      'The specified key does not exist',
      `/${resolvedBucket.bucketName}/${parsed.objectKey}`,
    )
  if (object.status !== 200 || !object.body) return object

  const shortCacheControl = resolveShortObjectCacheControl()
  const responseHeaders = new Headers(object.headers)
  responseHeaders.set('Cache-Control', shortCacheControl)
  const responseVersionId = await getResponseVersionIdForCurrentObject(
    resolvedBucket,
    parsed.objectKey,
  )
  if (responseVersionId) {
    responseHeaders.set('x-amz-version-id', responseVersionId)
  }

  const queryResponseType = query.get('response-content-type')
  if (queryResponseType) {
    responseHeaders.set('Content-Type', queryResponseType)
  }
  const queryDisposition = query.get('response-content-disposition')
  if (queryDisposition) {
    responseHeaders.set('Content-Disposition', queryDisposition)
  }

  const contentLength = parsePositiveContentLength(
    responseHeaders.get('content-length'),
  )
  if (!contentLength) {
    return new Response(object.body, {
      status: object.status,
      headers: responseHeaders,
    })
  }

  const [clientBody, cacheBody] = object.body.tee()
  const lastModified =
    parseHttpDate(responseHeaders.get('last-modified')) ?? null
  const contentType =
    responseHeaders.get('content-type') ?? 'application/octet-stream'
  const eTag = responseHeaders.get('etag')
  void cacheS3ObjectFromStream({
    cacheKey,
    stream: cacheBody,
    meta: {
      contentType,
      contentLength,
      eTag,
      lastModified,
      cacheControl: shortCacheControl,
    },
  })

  return new Response(clientBody, {
    status: object.status,
    headers: responseHeaders,
  })
}

export async function handleHead(
  request: Request,
  parsed: { bucketName: string | null; objectKey: string | null },
): Promise<Response> {
  if (!parsed.bucketName) return new Response(null, { status: 400 })
  const bucket =
    (await resolveAuthorizedBucket(request, parsed.bucketName)) ??
    (await resolveBucketByName(parsed.bucketName))
  if (!bucket) return new Response(null, { status: 403 })
  if (!parsed.objectKey) return new Response(null, { status: 200 })

  const versionId = new URL(request.url).searchParams.get('versionId')
  if (versionId)
    return (
      (await getObjectVersionResponse(
        bucket,
        parsed.objectKey,
        versionId,
        true,
      )) ?? new Response(null, { status: 404 })
    )

  const allowed = await ensureAccess(
    bucket,
    request,
    's3:GetObject',
    parsed.objectKey,
  )
  if (!allowed) return new Response(null, { status: 403 })
  const objectHead = await headObject(bucket, parsed.objectKey, {
    ifNoneMatch: request.headers.get('if-none-match'),
    ifModifiedSince: request.headers.get('if-modified-since'),
  })
  if (!objectHead) {
    return new Response(null, { status: 404 })
  }
  const responseVersionId = await getResponseVersionIdForCurrentObject(
    bucket,
    parsed.objectKey,
  )
  if (!responseVersionId) {
    return objectHead
  }

  const headers = new Headers(objectHead.headers)
  headers.set('x-amz-version-id', responseVersionId)
  return new Response(null, {
    status: objectHead.status,
    statusText: objectHead.statusText,
    headers,
  })
}
