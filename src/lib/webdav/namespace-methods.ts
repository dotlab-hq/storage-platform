import {
  copyObject,
  listObjectsV2,
  putObject,
} from '@/lib/s3-gateway/s3-object-store'
import type { BucketContext } from '@/lib/s3-gateway/s3-context'
import type { WebDavPrincipal } from '@/lib/webdav/auth'
import type { WebDavPath } from '@/lib/webdav/path'
import { collectionKey, parseDestinationPath, webDavHref, getParentKey } from '@/lib/webdav/path'
import { hasConflictingLock } from '@/lib/webdav/locks'
import { resourceFromPath, resolveDavBucket } from '@/lib/webdav/resources'
import { resolveVirtualFolderReadOnly } from '@/lib/s3-gateway/virtual-fs'
import { handleDelete } from '@/lib/webdav/write-methods'

function emptyBody(): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.close()
    },
  })
}

async function ensureDestination(input: {
  request: Request
  principal: WebDavPrincipal
}): Promise<{ path: WebDavPath; bucket: BucketContext } | Response> {
  const destination = parseDestinationPath(
    input.request.url,
    input.request.headers.get('destination'),
  )
  if (!destination?.bucketName) {
    return new Response('Destination must be a WebDAV bucket path', { status: 400 })
  }
  const resolved = await resolveDavBucket(input.principal, destination.bucketName)
  if (!resolved.ok) return resolved.response
  if (!resolved.bucket) {
    return new Response('Destination bucket is required', { status: 400 })
  }
  return { path: destination, bucket: resolved.bucket }
}

async function copyCollection(input: {
  sourceBucket: BucketContext
  sourceKey: string
  destinationBucket: BucketContext
  destinationKey: string
}): Promise<void> {
  const sourcePrefix = collectionKey(input.sourceKey)
  const destinationPrefix = collectionKey(input.destinationKey)
  const objects = await listObjectsV2(input.sourceBucket, sourcePrefix)
  await putObject(input.destinationBucket, destinationPrefix, emptyBody(), null, 0)
  await Promise.all(
    objects
      .filter((item) => !item.key.endsWith('/'))
      .map((item) =>
        copyObject(
          input.sourceBucket,
          item.key,
          input.destinationBucket,
          `${destinationPrefix}${item.key.slice(sourcePrefix.length)}`,
        ),
      ),
  )
}

export async function handleCopyMove(input: {
  request: Request
  path: WebDavPath
  principal: WebDavPrincipal
  move: boolean
}): Promise<Response> {
  if (!input.path.bucketName || !input.path.objectKey) {
    return new Response('Source object path is required', { status: 400 })
  }
  const destination = await ensureDestination(input)
  if (destination instanceof Response) return destination
  if (!destination.path.objectKey) {
    return new Response('Destination object path is required', { status: 400 })
  }

  // Lock checks on BOTH source and destination
  if (hasConflictingLock(input.request, input.path.bucketName, input.path.objectKey)) {
    return new Response('Resource is locked', { status: 423 })
  }
  if (hasConflictingLock(input.request, destination.path.bucketName, destination.path.objectKey)) {
    return new Response('Destination resource is locked', { status: 423 })
  }

  // Resolve source resource
  const sourceHref = webDavHref(input.path.bucketName, input.path.objectKey)
  const sourceResource = await resourceFromPath({
    path: input.path,
    href: sourceHref,
    principal: input.principal,
  })
  if (sourceResource instanceof Response) return sourceResource

  const source = await resolveDavBucket(input.principal, input.path.bucketName)
  if (!source.ok) return source.response
  if (!source.bucket) return new Response('Source bucket is required', { status: 400 })

  // Verify that the destination's parent folder exists
  const destParentKey = getParentKey(destination.path.objectKey)
  if (destParentKey) {
    const parentId = await resolveVirtualFolderReadOnly(
      input.principal.userId,
      destination.bucket.mappedFolderId,
      destParentKey,
    )
    if (parentId === 'not_found') {
      return new Response('Destination parent collection does not exist', { status: 409 })
    }
  }

  // Overwrite logic
  const overwrite = input.request.headers.get('overwrite')?.toUpperCase() !== 'F'
  const destHref = webDavHref(destination.path.bucketName, destination.path.objectKey)
  const destResource = await resourceFromPath({
    path: destination.path,
    href: destHref,
    principal: input.principal,
  })
  const destExisted = !(destResource instanceof Response) && destResource.exists

  if (destExisted) {
    if (!overwrite) {
      return new Response('Destination exists', { status: 412 })
    }
    // Delete destination before copy/move
    await handleDelete({
      request: input.request,
      path: destination.path,
      principal: input.principal,
    })
  }

  // Perform COPY
  if (sourceResource.isCollection) {
    await copyCollection({
      sourceBucket: source.bucket,
      sourceKey: sourceResource.objectKey ?? input.path.objectKey,
      destinationBucket: destination.bucket,
      destinationKey: destination.path.objectKey,
    })
  } else {
    await copyObject(
      source.bucket,
      sourceResource.objectKey ?? input.path.objectKey,
      destination.bucket,
      destination.path.objectKey,
    )
  }

  // Perform MOVE (delete source)
  if (input.move) {
    await handleDelete(input)
  }

  return new Response(null, { status: destExisted ? 204 : 201 })
}
