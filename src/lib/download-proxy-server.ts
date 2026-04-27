import { GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { requireProxyProvider } from '@/lib/upload-proxy-provider'
import { parseProviderId } from '@/lib/upload-proxy-utils'
import { sendWithProviderTimeout } from './s3-gateway/s3-provider-timeout'

function webStreamFromBody(body: unknown): ReadableStream<Uint8Array> {
  // Handle SDK v3 response body that has transformToWebStream (SpongeBlob)
  if (
    body &&
    typeof body === 'object' &&
    'transformToWebStream' in body &&
    typeof (body as { transformToWebStream?: unknown }).transformToWebStream ===
      'function'
  ) {
    return (
      body as { transformToWebStream: () => ReadableStream<Uint8Array> }
    ).transformToWebStream()
  }
  // For other cases, create an empty stream (should not happen with S3 SDK)
  return new ReadableStream()
}

export async function handleProxyDownloadRequest(
  request: Request,
  userId: string,
): Promise<Response> {
  // Parse object key and provider from URL or headers
  const url = new URL(request.url)
  const objectKey = url.searchParams.get('key')
  const providerIdRaw = request.headers.get('x-download-provider-id')
  const providerId = parseProviderId(providerIdRaw)

  if (!objectKey) {
    return Response.json({ error: 'Object key is required' }, { status: 400 })
  }

  const provider = await requireProxyProvider(providerId)

  // Stream the object from S3 directly through the worker
  const command = new GetObjectCommand({
    Bucket: provider.bucketName,
    Key: objectKey,
  })

  const upstream = await sendWithProviderTimeout((abortSignal) =>
    provider.client.send(command, { abortSignal }),
  )

  // Build response headers
  const headers = new Headers()
  if (upstream.ContentType) {
    headers.set('Content-Type', upstream.ContentType)
  }
  if (upstream.ContentLength !== undefined) {
    headers.set('Content-Length', String(upstream.ContentLength))
  }
  if (upstream.LastModified) {
    headers.set('Last-Modified', upstream.LastModified.toUTCString())
  }
  if (upstream.ETag) {
    headers.set('ETag', upstream.ETag)
  }
  if (upstream.Metadata) {
    for (const [key, value] of Object.entries(upstream.Metadata)) {
      if (typeof value === 'string') {
        headers.set(`x-amz-meta-${key}`, value)
      }
    }
  }

  // Stream the body directly - convert SDK body to web stream
  const bodyStream = webStreamFromBody(upstream.Body)

  return new Response(bodyStream, {
    status: 200,
    headers,
  })
}

export async function handleProxyDownloadRange(
  request: Request,
  userId: string,
): Promise<Response> {
  const url = new URL(request.url)
  const objectKey = url.searchParams.get('key')
  const providerIdRaw = request.headers.get('x-download-provider-id')
  const providerId = parseProviderId(providerIdRaw)

  if (!objectKey) {
    return Response.json({ error: 'Object key is required' }, { status: 400 })
  }

  // Get content length for range validation
  const provider = await requireProxyProvider(providerId)
  const headCommand = new HeadObjectCommand({
    Bucket: provider.bucketName,
    Key: objectKey,
  })
  const metadata = await sendWithProviderTimeout((abortSignal) =>
    provider.client.send(headCommand, { abortSignal }),
  )

  const contentLength = metadata.ContentLength ?? 0
  const rangeHeader = request.headers.get('Range')

  if (!rangeHeader) {
    // Return full object
    return handleProxyDownloadRequest(request, userId)
  }

  // Parse Range header
  const rangeMatch = rangeHeader.match(/bytes=(\d+)-(\d*)/)
  if (!rangeMatch) {
    return Response.json({ error: 'Invalid Range header' }, { status: 400 })
  }

  const start = parseInt(rangeMatch[1], 10)
  const end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : contentLength - 1

  if (start >= contentLength || end >= contentLength || start > end) {
    return Response.json({ error: 'Range not satisfiable' }, { status: 416 })
  }

  // S3 GetObject with Range parameter returns partial content
  const getCommand = new GetObjectCommand({
    Bucket: provider.bucketName,
    Key: objectKey,
    Range: `bytes=${start}-${end}`,
  })

  const upstream = await sendWithProviderTimeout((abortSignal) =>
    provider.client.send(getCommand, { abortSignal }),
  )

  const headers = new Headers()
  if (upstream.ContentType) {
    headers.set('Content-Type', upstream.ContentType)
  }
  const contentRange = `bytes ${start}-${end}/${contentLength}`
  headers.set('Content-Range', contentRange)
  const actualLength = end - start + 1
  headers.set('Content-Length', String(actualLength))
  if (upstream.ETag) {
    headers.set('ETag', upstream.ETag)
  }

  // Stream the partial body
  const bodyStream = webStreamFromBody(upstream.Body)

  return new Response(bodyStream, {
    status: 206,
    headers,
  })
}
