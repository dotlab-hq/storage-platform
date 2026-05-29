import { parseWebDavPath } from '@/lib/webdav/path'
import { authenticateWebDav } from '@/lib/webdav/auth'
import {
  createLock,
  refreshLock,
  unlock,
  hasConflictingLock,
} from '@/lib/webdav/locks'
import { resourceFromPath, resolveDavBucket } from '@/lib/webdav/resources'
import { putObject } from '@/lib/s3-gateway/s3-object-store'
import { handleGet, handleHead, handleOptions, handlePropfind } from './read-methods'
import { handleCopyMove } from './namespace-methods'
import {
  handleDelete,
  handleMkcol,
  handleProppatch,
  handlePut,
} from './write-methods'
import { davXmlResponse, lockInfoXml } from './xml'

function errorMessage(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : 'Unknown WebDAV error'
}

function parseLockOwner(body: string): string {
  const owner = body.match(/<[^:>]*:?owner\b[^>]*>([\s\S]*?)<\/[^:>]*:?owner>/i)
  return owner?.[1]?.replace(/<[^>]+>/g, '').trim() || 'Storage Platform WebDAV'
}

function parseLockScope(body: string): 'exclusive' | 'shared' {
  return body.toLowerCase().includes('<shared') ? 'shared' : 'exclusive'
}

function parseLockDepth(request: Request): '0' | 'infinity' {
  return request.headers.get('depth') === '0' ? '0' : 'infinity'
}

async function handleLock(request: Request): Promise<Response> {
  const principal = await authenticateWebDav(request)
  if (principal instanceof Response) return principal
  const path = parseWebDavPath(request.url)
  if (!path.bucketName) return new Response('Bucket is required', { status: 400 })
  if (principal.accessBucket.bucketName !== path.bucketName) {
    return new Response('Access denied', { status: 403 })
  }
  if (request.headers.get('if') && !request.body) {
    const refreshed = refreshLock(request, path.bucketName, path.objectKey)
    if (!refreshed) return new Response('Lock token not found', { status: 412 })
    return davXmlResponse(lockInfoXml(refreshed), 200)
  }
  if (hasConflictingLock(request, path.bucketName, path.objectKey)) {
    return new Response('Resource is locked', { status: 423 })
  }

  const resource = await resourceFromPath({
    path,
    href: request.url,
    principal,
  })
  const existed = !(resource instanceof Response) && resource.exists

  if (!existed && path.objectKey) {
    const resolved = await resolveDavBucket(principal, path.bucketName)
    if (resolved.ok && resolved.bucket) {
      await putObject(
        resolved.bucket,
        path.objectKey,
        new ReadableStream<Uint8Array>({
          start(controller) {
            controller.close()
          },
        }),
        'application/octet-stream',
        0,
      )
    }
  }

  const body = await request.text()
  const lock = createLock({
    request,
    bucketName: path.bucketName,
    objectKey: path.objectKey,
    owner: parseLockOwner(body),
    depth: parseLockDepth(request),
    scope: parseLockScope(body),
  })
  if (lock === 'conflict') return new Response('Lock conflict', { status: 423 })
  return davXmlResponse(lockInfoXml(lock), existed ? 200 : 201)
}

async function dispatchAuthed(request: Request): Promise<Response> {
  const principal = await authenticateWebDav(request)
  if (principal instanceof Response) return principal
  const path = parseWebDavPath(request.url)
  const input = { request, path, principal }

  if (request.method === 'OPTIONS') return handleOptions()
  if (request.method === 'PROPFIND') return handlePropfind(input)
  if (request.method === 'GET') return handleGet(input)
  if (request.method === 'HEAD') return handleHead(input)
  if (request.method === 'PUT') return handlePut(input)
  if (request.method === 'MKCOL') return handleMkcol(input)
  if (request.method === 'DELETE') return handleDelete(input)
  if (request.method === 'COPY') return handleCopyMove({ ...input, move: false })
  if (request.method === 'MOVE') return handleCopyMove({ ...input, move: true })
  if (request.method === 'PROPPATCH') return handleProppatch(request, path)
  if (request.method === 'UNLOCK') {
    return new Response(null, { status: unlock(request, path.bucketName ?? '', path.objectKey) ? 204 : 409 })
  }
  return new Response('Method not allowed', { status: 405 })
}

export async function handleWebDavRequest(request: Request): Promise<Response> {
  try {
    if (request.method === 'OPTIONS') return handleOptions()
    if (request.method === 'LOCK') return handleLock(request)
    return await dispatchAuthed(request)
  } catch (error) {
    return new Response(errorMessage(error), { status: 500 })
  }
}
