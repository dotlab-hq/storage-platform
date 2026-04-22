import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { db } from '@/db'
import { objectAcl, fileTag, fileVersion } from '@/db/schema/s3-controls'
import { file } from '@/db/schema/storage'
import { virtualBucket } from '@/db/schema/s3-gateway'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { and, desc, eq } from 'drizzle-orm'
import { buildUpstreamObjectKey } from '@/lib/s3-gateway/upload-key-utils'
import { restoreObjectVersion } from '@/lib/s3-gateway/s3-versioning'

const QuerySchema = z.object({
  bucketName: z.string().min(3),
  objectKey: z.string().min(1),
})

const UpdateSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('tags'),
    bucketName: z.string(),
    objectKey: z.string(),
    tags: z.array(z.object({ key: z.string(), value: z.string() })),
  }),
  z.object({
    action: z.literal('acl'),
    bucketName: z.string(),
    objectKey: z.string(),
    cannedAcl: z.enum(['private', 'public-read']),
  }),
  z.object({
    action: z.literal('restore'),
    bucketName: z.string(),
    objectKey: z.string(),
    versionId: z.string().min(1),
  }),
])

function message(error: unknown, fallback: string): string {
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? fallback
  if (error instanceof Error) return error.message
  return fallback
}

type ResolvedOwnedObject = {
  bucketId: string
  mappedFolderId: string | null
  file: {
    id: string
    name: string
    sizeInBytes: number
    mimeType: string | null
    etag: string | null
    lastModified: Date | null
    objectKey: string
  }
}

type OwnedBucket = {
  id: string
  mappedFolderId: string | null
}

async function resolveOwnedBucket(
  userId: string,
  bucketName: string,
): Promise<OwnedBucket | null> {
  const buckets = await db
    .select({
      id: virtualBucket.id,
      mappedFolderId: virtualBucket.mappedFolderId,
    })
    .from(virtualBucket)
    .where(
      and(
        eq(virtualBucket.userId, userId),
        eq(virtualBucket.name, bucketName),
        eq(virtualBucket.isActive, true),
      ),
    )
    .limit(1)

  const bucket = buckets.at(0)
  if (bucket === undefined) return null
  return bucket
}

async function resolveOwnedObject(
  userId: string,
  bucketName: string,
  objectKey: string,
): Promise<ResolvedOwnedObject | null> {
  const bucket = await resolveOwnedBucket(userId, bucketName)
  if (bucket === null) return null

  const upstreamKey = buildUpstreamObjectKey(
    userId,
    bucket.id,
    bucket.mappedFolderId,
    objectKey,
  )
  const files = await db
    .select({
      id: file.id,
      name: file.name,
      sizeInBytes: file.sizeInBytes,
      mimeType: file.mimeType,
      etag: file.etag,
      lastModified: file.lastModified,
      objectKey: file.objectKey,
    })
    .from(file)
    .where(
      and(
        eq(file.userId, userId),
        eq(file.objectKey, upstreamKey),
        eq(file.isDeleted, false),
      ),
    )
    .limit(1)

  const targetFile = files.at(0)
  if (targetFile === undefined) return null

  return {
    bucketId: bucket.id,
    mappedFolderId: bucket.mappedFolderId,
    file: targetFile,
  }
}

export const Route = createFileRoute(
  '/api/storage/s3/object-settings' as never,
)({
  component: () => null,
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const user = await getAuthenticatedUser()
          const parsed = QuerySchema.parse(
            Object.fromEntries(new URL(request.url).searchParams.entries()),
          )
          const bucket = await resolveOwnedBucket(user.id, parsed.bucketName)
          if (!bucket)
            return Response.json({ error: 'Object not found' }, { status: 404 })

          const resolved = await resolveOwnedObject(
            user.id,
            parsed.bucketName,
            parsed.objectKey,
          )
          const fallbackProperties = {
            id: '',
            name: parsed.objectKey.split('/').at(-1) ?? parsed.objectKey,
            sizeInBytes: 0,
            mimeType: null,
            etag: null,
            lastModified: null,
            objectKey: buildUpstreamObjectKey(
              user.id,
              bucket.id,
              bucket.mappedFolderId,
              parsed.objectKey,
            ),
          }

          const [tags, aclRows, versions] = await Promise.all([
            resolved
              ? db
                  .select({ key: fileTag.tagKey, value: fileTag.tagValue })
                  .from(fileTag)
                  .where(eq(fileTag.fileId, resolved.file.id))
              : Promise.resolve([]),
            resolved
              ? db
                  .select({ cannedAcl: objectAcl.cannedAcl })
                  .from(objectAcl)
                  .where(eq(objectAcl.fileId, resolved.file.id))
                  .limit(1)
              : Promise.resolve([]),
            db
              .select({
                versionId: fileVersion.versionId,
                isDeleteMarker: fileVersion.isDeleteMarker,
                createdAt: fileVersion.createdAt,
                etag: fileVersion.etag,
                sizeInBytes: fileVersion.sizeInBytes,
              })
              .from(fileVersion)
              .where(
                and(
                  eq(fileVersion.bucketId, bucket.id),
                  eq(fileVersion.objectKey, parsed.objectKey),
                ),
              )
              .orderBy(desc(fileVersion.createdAt))
              .limit(50),
          ])

          if (!resolved && versions.length === 0) {
            return Response.json({ error: 'Object not found' }, { status: 404 })
          }

          return Response.json({
            properties: resolved?.file ?? fallbackProperties,
            tags,
            acl: aclRows[0]?.cannedAcl ?? 'private',
            versions,
          })
        } catch (error) {
          return Response.json(
            { error: message(error, 'Failed to load object settings') },
            { status: 500 },
          )
        }
      },
      PUT: async ({ request }) => {
        try {
          const user = await getAuthenticatedUser()
          const payload = UpdateSchema.parse(await request.json())
          const bucket = await resolveOwnedBucket(user.id, payload.bucketName)
          if (!bucket)
            return Response.json({ error: 'Object not found' }, { status: 404 })
          const resolved = await resolveOwnedObject(
            user.id,
            payload.bucketName,
            payload.objectKey,
          )

          if (payload.action === 'tags') {
            if (!resolved)
              return Response.json(
                { error: 'Object not found' },
                { status: 404 },
              )
            await db.delete(fileTag).where(eq(fileTag.fileId, resolved.file.id))
            if (payload.tags.length > 0) {
              await db.insert(fileTag).values(
                payload.tags.map((tag) => ({
                  fileId: resolved.file.id,
                  tagKey: tag.key,
                  tagValue: tag.value,
                })),
              )
            }
          }

          if (payload.action === 'acl') {
            if (!resolved)
              return Response.json(
                { error: 'Object not found' },
                { status: 404 },
              )
            await db
              .insert(objectAcl)
              .values({
                fileId: resolved.file.id,
                ownerCanonicalId: user.id,
                cannedAcl: payload.cannedAcl,
              })
              .onConflictDoUpdate({
                target: objectAcl.fileId,
                set: { cannedAcl: payload.cannedAcl },
              })
          }

          if (payload.action === 'restore') {
            await restoreObjectVersion(
              {
                userId: user.id,
                bucketId: bucket.id,
                bucketName: payload.bucketName,
                mappedFolderId: bucket.mappedFolderId,
                createdAt: new Date(),
              },
              payload.objectKey,
              payload.versionId,
            )
          }

          return Response.json({ ok: true })
        } catch (error) {
          return Response.json(
            {
              ok: false,
              error: message(error, 'Failed to update object settings'),
            },
            { status: 500 },
          )
        }
      },
    },
  },
})
