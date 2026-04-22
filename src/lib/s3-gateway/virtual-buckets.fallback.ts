import { and, eq, like } from 'drizzle-orm'
import { db } from '@/db'
import { file, folder, userStorage } from '@/db/schema/storage'

type BucketFileRow = {
  objectKey: string
  sizeInBytes: number
}

export async function getActiveBucketFiles(
  userId: string,
  prefix: string,
): Promise<BucketFileRow[]> {
  try {
    return await db
      .select({
        objectKey: file.objectKey,
        sizeInBytes: file.sizeInBytes,
      })
      .from(file)
      .where(
        and(
          eq(file.userId, userId),
          eq(file.isDeleted, false),
          like(file.objectKey, prefix),
        ),
      )
  } catch (error) {
    const message =
      error instanceof Error ? `${error.name}: ${error.message}` : 'Unknown'
    console.warn(
      '[S3 Gateway] fallback to prefix-only lookup due to schema mismatch:',
      message,
    )
  }

  try {
    return await db
      .select({
        objectKey: file.objectKey,
        sizeInBytes: file.sizeInBytes,
      })
      .from(file)
      .where(like(file.objectKey, prefix))
  } catch (fallbackError) {
    const message =
      fallbackError instanceof Error
        ? `${fallbackError.name}: ${fallbackError.message}`
        : 'Unknown'
    console.warn('[S3 Gateway] fallback lookup failed:', message)
  }

  try {
    const keyOnlyRows = await db
      .select({ objectKey: file.objectKey })
      .from(file)
      .where(like(file.objectKey, prefix))

    return keyOnlyRows.map((row) => ({
      objectKey: row.objectKey,
      sizeInBytes: 0,
    }))
  } catch (finalError) {
    const message =
      finalError instanceof Error
        ? `${finalError.name}: ${finalError.message}`
        : 'Unknown'
    console.warn('[S3 Gateway] unable to enumerate bucket files:', message)
    return []
  }
}

export async function softDeleteByPrefix(
  userId: string,
  prefix: string,
): Promise<void> {
  const now = new Date()
  try {
    await db
      .update(file)
      .set({ isDeleted: true, deletedAt: now })
      .where(
        and(
          eq(file.userId, userId),
          eq(file.isDeleted, false),
          like(file.objectKey, prefix),
        ),
      )
  } catch (error) {
    const message =
      error instanceof Error ? `${error.name}: ${error.message}` : 'Unknown'
    console.warn(
      '[S3 Gateway] soft-delete failed, falling back to hard delete:',
      message,
    )
    await db.delete(file).where(like(file.objectKey, prefix))
  }
}

export async function decrementUserStorage(
  userId: string,
  bytes: number,
): Promise<void> {
  if (bytes <= 0) {
    return
  }

  const rows = await db
    .select({ usedStorage: userStorage.usedStorage })
    .from(userStorage)
    .where(eq(userStorage.userId, userId))
    .limit(1)

  if (rows.length === 0) {
    return
  }

  const next = Math.max(0, rows[0].usedStorage - bytes)
  await db
    .update(userStorage)
    .set({ usedStorage: next })
    .where(eq(userStorage.userId, userId))
}

export async function hasActiveObjects(
  userId: string,
  prefix: string,
): Promise<boolean> {
  try {
    const rows = await db
      .select({ objectKey: file.objectKey })
      .from(file)
      .where(
        and(
          eq(file.userId, userId),
          eq(file.isDeleted, false),
          like(file.objectKey, prefix),
        ),
      )
      .limit(1)
    return rows.length > 0
  } catch (error) {
    const message =
      error instanceof Error ? `${error.name}: ${error.message}` : 'Unknown'
    console.warn(
      '[S3 Gateway] strict emptiness check failed, using prefix-only check:',
      message,
    )
  }

  try {
    const rows = await db
      .select({ objectKey: file.objectKey })
      .from(file)
      .where(like(file.objectKey, prefix))
      .limit(1)
    return rows.length > 0
  } catch (fallbackError) {
    const message =
      fallbackError instanceof Error
        ? `${fallbackError.name}: ${fallbackError.message}`
        : 'Unknown'
    console.warn(
      '[S3 Gateway] prefix-only emptiness check failed; skipping strict validation:',
      message,
    )
    return false
  }
}

export async function deleteMappedFolder(
  userId: string,
  mappedFolderId: string,
): Promise<void> {
  await db
    .update(folder)
    .set({ isDeleted: true, deletedAt: new Date() })
    .where(and(eq(folder.id, mappedFolderId), eq(folder.userId, userId)))
}
