import {
  parseAccessKeyId,
  resolveBucketByName,
} from '@/lib/s3-gateway/s3-context'
import { applyBucketCors } from '@/lib/s3-gateway/s3-cors'
import { ensureS3FileSchemaCompatibility } from '@/lib/s3-gateway/s3-file-schema-compat'
import { inferS3Operation, recordS3Audit } from '@/lib/s3-gateway/s3-audit'
import { ProviderRequestTimeoutError } from '@/lib/s3-gateway/s3-provider-timeout'
import {
  mapProviderStatusToS3Error,
  providerHttpStatusCode,
} from '@/lib/s3-gateway/s3-dispatch-context'
import { handleGet, handleHead } from '@/lib/s3-gateway/s3-dispatch-read'
import { handlePut } from '@/lib/s3-gateway/s3-dispatch-put'
import {
  handleDelete,
  handlePost,
} from '@/lib/s3-gateway/s3-dispatch-mutations'
import { parseS3Path } from '@/lib/s3-gateway/s3-request'
import { s3ErrorResponse } from '@/lib/s3-gateway/s3-xml'

async function auditResponse(input: {
  request: Request
  response: Response
  requestId: string
  startedAt: number
  parsedPath: { bucketName: string | null; objectKey: string | null }
  userId: string | null
  accessKeyId: string | null
  errorCode: string | null
}): Promise<Response> {
  await recordS3Audit({
    requestId: input.requestId,
    userId: input.userId,
    accessKeyId: input.accessKeyId,
    bucketName: input.parsedPath.bucketName ?? '',
    objectKey: input.parsedPath.objectKey,
    operation: inferS3Operation(input.request),
    httpStatus: input.response.status,
    errorCode: input.errorCode,
    durationMs: Date.now() - input.startedAt,
    sourceIp: input.request.headers.get('cf-connecting-ip'),
    userAgent: input.request.headers.get('user-agent'),
  })
  return input.response
}

export async function handleS3Request(request: Request): Promise<Response> {
  const startedAt = Date.now()
  const requestId = crypto.randomUUID()

  let parsedPath: { bucketName: string | null; objectKey: string | null } = {
    bucketName: null,
    objectKey: null,
  }
  let bucketForCors: Awaited<ReturnType<typeof resolveBucketByName>> | null =
    null
  let accessKeyId: string | null = null

  try {
    parsedPath = parseS3Path(request.url)
    bucketForCors = parsedPath.bucketName
      ? await resolveBucketByName(parsedPath.bucketName)
      : null
    accessKeyId = parseAccessKeyId(request)

    await ensureS3FileSchemaCompatibility()

    const response = await (async () => {
      if (request.method === 'OPTIONS')
        return new Response(null, { status: 204 })
      if (request.method === 'GET') return handleGet(request, parsedPath)
      if (request.method === 'HEAD') return handleHead(request, parsedPath)
      if (request.method === 'PUT') return handlePut(request, parsedPath)
      if (request.method === 'DELETE') return handleDelete(request, parsedPath)
      if (request.method === 'POST') return handlePost(request, parsedPath)
      return s3ErrorResponse(
        405,
        'MethodNotAllowed',
        'The specified method is not allowed against this resource',
        new URL(request.url).pathname,
      )
    })()

    const corsResponse = await applyBucketCors(
      request,
      await response,
      bucketForCors,
    )
    return auditResponse({
      request,
      response: corsResponse,
      requestId,
      startedAt,
      parsedPath,
      userId: bucketForCors?.userId ?? null,
      accessKeyId,
      errorCode: corsResponse.status >= 400 ? 'Error' : null,
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : 'Unknown server error'
    const resource = new URL(request.url).pathname

    let response: Response
    let errorCode: string | null = 'InternalError'

    if (error instanceof ProviderRequestTimeoutError) {
      response = s3ErrorResponse(504, 'RequestTimeout', message, resource)
      errorCode = 'RequestTimeout'
    } else if (/Invalid or expired upload ID/i.test(message)) {
      response = s3ErrorResponse(404, 'NoSuchUpload', message, resource)
      errorCode = 'NoSuchUpload'
    } else if (/MalformedXML|InvalidPart/i.test(message)) {
      response = s3ErrorResponse(400, 'MalformedXML', message, resource)
      errorCode = 'MalformedXML'
    } else if (/NoSuchKey/i.test(message)) {
      response = s3ErrorResponse(404, 'NoSuchKey', message, resource)
      errorCode = 'NoSuchKey'
    } else if (/NoSuchVersion/i.test(message)) {
      response = s3ErrorResponse(404, 'NoSuchVersion', message, resource)
      errorCode = 'NoSuchVersion'
    } else if (/Virtual bucket not found|Bucket not found/i.test(message)) {
      response = s3ErrorResponse(404, 'NoSuchBucket', message, resource)
      errorCode = 'NoSuchBucket'
    } else {
      const upstreamStatusCode = providerHttpStatusCode(error)
      if (upstreamStatusCode !== null) {
        const mapped = mapProviderStatusToS3Error(upstreamStatusCode)
        response = s3ErrorResponse(
          mapped.status,
          mapped.code,
          mapped.message,
          resource,
        )
        errorCode = mapped.code
      } else {
        response = s3ErrorResponse(500, 'InternalError', message, resource)
      }
    }

    const corsResponse = await applyBucketCors(request, response, bucketForCors)
    return auditResponse({
      request,
      response: corsResponse,
      requestId,
      startedAt,
      parsedPath,
      userId: bucketForCors?.userId ?? null,
      accessKeyId,
      errorCode,
    })
  }
}
