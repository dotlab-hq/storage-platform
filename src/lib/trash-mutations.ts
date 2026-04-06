import { eq, and } from 'drizzle-orm'
import { getProviderClientById } from '@/lib/s3-provider-client'

export async function restoreItems(
  userId: string,
  itemIds: string[],
  itemTypes: ('file' | 'folder')[],
) {
  const [{ db }, { file: storageFile, folder }] = await Promise.all([
    import('@/db'),
    import('@/db/schema/storage'),
  ])

  const fileIds: string[] = []
  const folderIds: string[] = []
  for (let i = 0; i < itemIds.length; i++) {
    if (itemTypes[i] === 'file') fileIds.push(itemIds[i])
    else folderIds.push(itemIds[i])
  }

  await Promise.all([
    ...fileIds.map((id) =>
      db
        .update(storageFile)
        .set({ isDeleted: false, deletedAt: null })
        .where(and(eq(storageFile.id, id), eq(storageFile.userId, userId))),
    ),
    ...folderIds.map((id) =>
      db
        .update(folder)
        .set({ isDeleted: false, deletedAt: null })
        .where(and(eq(folder.id, id), eq(folder.userId, userId))),
    ),
  ])

  const { invalidateFolderCache, invalidateQuotaCache } =
    await import('@/lib/cache-invalidation')
  await invalidateQuotaCache(userId)

  // Invalidate everything to be safe since things could be restored anywhere
  await invalidateFolderCache(userId, null)

  return { restored: itemIds.length }
}

export async function permanentDeleteItems(
  userId: string,
  itemIds: string[],
  itemTypes: ('file' | 'folder')[],
) {
  const [{ db }, { file: storageFile, folder, userStorage }] =
    await Promise.all([import('@/db'), import('@/db/schema/storage')])

  const { DeleteObjectCommand } = await import('@aws-sdk/client-s3')

  const fileIds: string[] = []
  const folderIds: string[] = []
  for (let i = 0; i < itemIds.length; i++) {
    if (itemTypes[i] === 'file') fileIds.push(itemIds[i])
    else folderIds.push(itemIds[i])
  }

  let freedBytes = 0

  // Delete files from S3 + DB
  for (const id of fileIds) {
    const fileRows = await db
      .select({
        objectKey: storageFile.objectKey,
        sizeInBytes: storageFile.sizeInBytes,
        providerId: storageFile.providerId,
      })
      .from(storageFile)
      .where(and(eq(storageFile.id, id), eq(storageFile.userId, userId)))
      .limit(1)
    if (fileRows.length === 0) {
      continue
    }
    const row = fileRows[0]

    try {
      const provider = await getProviderClientById(row.providerId ?? null)
      await provider.client.send(
        new DeleteObjectCommand({
          Bucket: provider.bucketName,
          Key: row.objectKey,
        }),
      )
    } catch (err) {
      console.error(`[Server] S3 delete failed for key=${row.objectKey}:`, err)
    }
    freedBytes += row.sizeInBytes
    await db
      .delete(storageFile)
      .where(and(eq(storageFile.id, id), eq(storageFile.userId, userId)))
  }

  // Delete folders from DB
  for (const id of folderIds) {
    await db
      .delete(folder)
      .where(and(eq(folder.id, id), eq(folder.userId, userId)))
  }

  // Update used storage
  if (freedBytes > 0) {
    const currentStorageRows = await db
      .select({ usedStorage: userStorage.usedStorage })
      .from(userStorage)
      .where(eq(userStorage.userId, userId))
      .limit(1)

    if (currentStorageRows.length > 0) {
      const currentStorage = currentStorageRows[0]
      const newUsed = Math.max(0, currentStorage.usedStorage - freedBytes)
      await db
        .update(userStorage)
        .set({ usedStorage: newUsed })
        .where(eq(userStorage.userId, userId))
    }
  }

  const { invalidateFolderCache, invalidateQuotaCache } =
    await import('@/lib/cache-invalidation')
  await invalidateQuotaCache(userId)
  await invalidateFolderCache(userId, null)

  return {
    deletedFiles: fileIds.length,
    deletedFolders: folderIds.length,
    freedBytes,
  }
}
