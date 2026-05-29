import {
  deleteObject,
  listObjectsV2,
  putObject,
} from '@/lib/s3-gateway/s3-object-store'
import type { WebDavPrincipal } from '@/lib/webdav/auth'
import type { WebDavPath } from '@/lib/webdav/path'
import { collectionKey, webDavHref, getParentKey } from '@/lib/webdav/path'
import { hasConflictingLock } from '@/lib/webdav/locks'
import { resourceFromPath, resolveDavBucket } from '@/lib/webdav/resources'
import { resolveVirtualFolderReadOnly } from '@/lib/s3-gateway/virtual-fs'
import {
  davXmlResponse,
  multiStatusXml,
  parseProppatchNames,
} from '@/lib/webdav/xml'

function lockedResponse(): Response {
  return new Response('Resource is locked', { status: 423 })
}

function emptyBody(): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.close()
    },
  })
}

function contentLength(request: Request): number | null {
  const value = request.headers.get('content-length')
  if (!value) return null
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

async function resourceExists(input: {
  path: WebDavPath
  principal: WebDavPrincipal
}): Promise<boolean> {
  const resource = await resourceFromPath({
    path: input.path,
    href: webDavHref(input.path.bucketName, input.path.objectKey),
    principal: input.principal,
  })
  return !(resource instanceof Response) && resource.exists
}

export async function handlePut(input: {
  request: Request
  path: WebDavPath
  principal: WebDavPrincipal
}): Promise<Response> {
  if (!input.path.bucketName || !input.path.objectKey) {
    return new Response('Bucket and object path are required', { status: 400 })
  }
  if (hasConflictingLock(input.request, input.path.bucketName, input.path.objectKey)) {
    return lockedResponse()
  }
  const resolved = await resolveDavBucket(input.principal, input.path.bucketName)
  if (!resolved.ok) return resolved.response
  if (!resolved.bucket || !input.request.body) {
    return new Response('Request body is required', { status: 400 })
  }

  // Check parent folder existence
  const parentKey = getParentKey(input.path.objectKey)
  if (parentKey) {
    const parentId = await resolveVirtualFolderReadOnly(
      input.principal.userId,
      resolved.bucket.mappedFolderId,
      parentKey,
    )
    if (parentId === 'not_found') {
      return new Response('Parent collection does not exist', { status: 409 })
    }
  }

  // Check if target resource exists and is a collection
  const resource = await resourceFromPath({
    path: input.path,
    href: webDavHref(input.path.bucketName, input.path.objectKey),
    principal: input.principal,
  })
  const existed = !(resource instanceof Response) && resource.exists
  if (existed && resource.isCollection) {
    return new Response('Cannot overwrite a collection with a file', { status: 409 })
  }

  await putObject(
    resolved.bucket,
    input.path.objectKey,
    input.request.body,
    input.request.headers.get('content-type'),
    contentLength(input.request),
  )
  return new Response(null, { status: existed ? 204 : 201 })
}

export async function handleMkcol(input: {
  request: Request
  path: WebDavPath
  principal: WebDavPrincipal
}): Promise<Response> {
  if (!input.path.bucketName || !input.path.objectKey) {
    return new Response('Collection path is required', { status: 400 })
  }

  // Return 415 if a body is present
  const len = contentLength(input.request)
  if (len !== null && len > 0) {
    return new Response('MKCOL body not supported', { status: 415 })
  }

  const key = collectionKey(input.path.objectKey)
  if (hasConflictingLock(input.request, input.path.bucketName, key)) {
    return lockedResponse()
  }
  const resolved = await resolveDavBucket(input.principal, input.path.bucketName)
  if (!resolved.ok) return resolved.response
  if (!resolved.bucket) return new Response('Bucket is required', { status: 400 })

  // Check if the target resource already exists
  const resource = await resourceFromPath({
    path: input.path,
    href: webDavHref(input.path.bucketName, input.path.objectKey),
    principal: input.principal,
  })
  const existed = !(resource instanceof Response) && resource.exists
  if (existed) {
    return new Response('Resource already exists', { status: 405 })
  }

  // Check parent folder existence
  const parentKey = getParentKey(input.path.objectKey)
  if (parentKey) {
    const parentId = await resolveVirtualFolderReadOnly(
      input.principal.userId,
      resolved.bucket.mappedFolderId,
      parentKey,
    )
    if (parentId === 'not_found') {
      return new Response('Parent collection does not exist', { status: 409 })
    }
  }

  await putObject(resolved.bucket, key, emptyBody(), 'httpd/unix-directory', 0)
  return new Response(null, { status: 201 })
}

export async function handleDelete(input: {
  request: Request
  path: WebDavPath
  principal: WebDavPrincipal
}): Promise<Response> {
  if (!input.path.bucketName) return new Response('Bucket is required', { status: 400 })
  if (hasConflictingLock(input.request, input.path.bucketName, input.path.objectKey)) {
    return lockedResponse()
  }
  const resolved = await resolveDavBucket(input.principal, input.path.bucketName)
  if (!resolved.ok) return resolved.response
  if (!resolved.bucket) return new Response('Bucket is required', { status: 400 })
  const bucket = resolved.bucket
  const prefix = input.path.objectKey ? collectionKey(input.path.objectKey) : ''
  const keys = input.path.objectKey
    ? (await listObjectsV2(bucket, prefix)).map((item) => item.key)
    : []
  if (input.path.objectKey && !keys.includes(input.path.objectKey)) {
    keys.push(input.path.objectKey)
  }
  await Promise.all(keys.map((key) => deleteObject(bucket, key)))
  return new Response(null, { status: 204 })
}

export async function handleProppatch(request: Request, path: WebDavPath) {
  const names = parseProppatchNames(await request.text())
  const props = names.length > 0 ? names.map((name) => `<D:${name}/>`): ['<D:prop/>']
  return davXmlResponse(
    multiStatusXml([{ href: webDavHref(path.bucketName, path.objectKey), propstats: [{ status: 403, props }] }]),
  )
}
