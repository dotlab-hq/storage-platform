import { db } from '@/db'
import { file } from '@/db/schema/storage'
import { and, eq, isNull, ne } from 'drizzle-orm'

export type CompletedUpload = {
  id: string
  name: string
  objectKey: string
  sizeInBytes: number
  providerId: string | null
  etag: string | null
  cacheControl: string | null
  lastModified: Date | null
}

export async function findCommittedFile(
  userId: string,
  upstreamObjectKey: string,
): Promise<CompletedUpload | null> {
  const rows = await db
    .select({
      id: file.id,
      name: file.name,
      objectKey: file.objectKey,
      sizeInBytes: file.sizeInBytes,
      providerId: file.providerId,
      etag: file.etag,
      cacheControl: file.cacheControl,
      lastModified: file.lastModified,
    })
    .from(file)
    .where(
      and(
        eq(file.userId, userId),
        eq(file.objectKey, upstreamObjectKey),
        eq(file.isDeleted, false),
      ),
    )
    .limit(1)

  return rows[0] ?? null
}

function pathCondition(input: {
  userId: string
  mappedFolderId: string | null
  fileName: string
}) {
  return and(
    eq(file.userId, input.userId),
    eq(file.name, input.fileName),
    eq(file.isDeleted, false),
    input.mappedFolderId
      ? eq(file.folderId, input.mappedFolderId)
      : isNull(file.folderId),
  )
}

async function findCommittedFileByPath(input: {
  userId: string
  mappedFolderId: string | null
  fileName: string
}): Promise<CompletedUpload | null> {
  const rows = await db
    .select({
      id: file.id,
      name: file.name,
      objectKey: file.objectKey,
      sizeInBytes: file.sizeInBytes,
      providerId: file.providerId,
      etag: file.etag,
      cacheControl: file.cacheControl,
      lastModified: file.lastModified,
    })
    .from(file)
    .where(pathCondition(input))
    .limit(1)

  return rows[0] ?? null
}

async function softDeleteDuplicatePathRows(input: {
  userId: string
  mappedFolderId: string | null
  fileName: string
  keepId: string
}): Promise<void> {
  await db
    .update(file)
    .set({
      isDeleted: true,
      deletedAt: new Date(),
    })
    .where(and(pathCondition(input), ne(file.id, input.keepId)))
}

export async function upsertCommittedFile(input: {
  userId: string
  providerId: string | null
  objectKey: string
  contentType: string | null
  mappedFolderId: string | null
  fileName: string
  sizeInBytes: number
  etag?: string | null
  cacheControl?: string | null
  lastModified?: Date | null
}): Promise<CompletedUpload> {
  const existing = await findCommittedFile(input.userId, input.objectKey)
  const existingByPath = existing
    ? null
    : await findCommittedFileByPath({
        userId: input.userId,
        mappedFolderId: input.mappedFolderId,
        fileName: input.fileName,
      })
  const rowToUpdate = existing ?? existingByPath

  if (rowToUpdate) {
    const updatedRows = await db
      .update(file)
      .set({
        name: input.fileName,
        objectKey: input.objectKey,
        sizeInBytes: input.sizeInBytes,
        mimeType: input.contentType,
        providerId: input.providerId,
        folderId: input.mappedFolderId,
        etag: input.etag ?? null,
        cacheControl: input.cacheControl ?? null,
        lastModified: input.lastModified ?? null,
        isDeleted: false,
        deletedAt: null,
      })
      .where(eq(file.id, rowToUpdate.id))
      .returning({
        id: file.id,
        name: file.name,
        objectKey: file.objectKey,
        sizeInBytes: file.sizeInBytes,
        providerId: file.providerId,
        etag: file.etag,
        cacheControl: file.cacheControl,
        lastModified: file.lastModified,
      })
    await softDeleteDuplicatePathRows({
      userId: input.userId,
      mappedFolderId: input.mappedFolderId,
      fileName: input.fileName,
      keepId: updatedRows[0].id,
    })
    return updatedRows[0]
  }

  const insertedRows = await db
    .insert(file)
    .values({
      userId: input.userId,
      name: input.fileName,
      objectKey: input.objectKey,
      sizeInBytes: input.sizeInBytes,
      mimeType: input.contentType,
      providerId: input.providerId,
      folderId: input.mappedFolderId,
      etag: input.etag ?? null,
      cacheControl: input.cacheControl ?? null,
      lastModified: input.lastModified ?? null,
      isDeleted: false,
    })
    .returning({
      id: file.id,
      name: file.name,
      objectKey: file.objectKey,
      sizeInBytes: file.sizeInBytes,
      providerId: file.providerId,
      etag: file.etag,
      cacheControl: file.cacheControl,
      lastModified: file.lastModified,
    })

  return insertedRows[0]
}
