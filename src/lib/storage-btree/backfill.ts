import { eq } from 'drizzle-orm'
import { Cache } from '@/lib/Cache'
import { db } from '@/db'
import { file, folder } from '@/db/schema/storage'
import { storageNodeBtree } from '@/db/schema/storage-btree'
import { joinPath } from '@/lib/storage-btree/path'

const BACKFILL_TTL_SECONDS = 10 * 60

export async function backfillStorageBtree(userId: string): Promise<void> {
  const markerKey = `btree:backfill:${userId}`
  const marker = await Cache.get<string>(markerKey)
  if (marker === 'done') {
    return
  }

  // Fetch all folders for the user
  const folders = await db
    .select({
      id: folder.id,
      name: folder.name,
      parentFolderId: folder.parentFolderId,
      isDeleted: folder.isDeleted,
    })
    .from(folder)
    .where(eq(folder.userId, userId))

  // Build map id -> folder
  const folderMap = new Map<string, (typeof folders)[0]>()
  folders.forEach((f) => folderMap.set(f.id, f))

  // Compute full paths for all folders with memoization and cycle detection
  const fullPathCache = new Map<string, string>()
  function computeFullPath(folderId: string, visited: Set<string>): string {
    const cached = fullPathCache.get(folderId)
    if (cached !== undefined) return cached
    const row = folderMap.get(folderId)
    if (!row) {
      fullPathCache.set(folderId, '')
      return ''
    }
    if (visited.has(folderId)) {
      // Cycle detected; return just the name to avoid infinite recursion
      fullPathCache.set(folderId, row.name)
      return row.name
    }
    visited.add(folderId)
    const parentPath = row.parentFolderId
      ? computeFullPath(row.parentFolderId, visited)
      : ''
    const full = parentPath ? `${parentPath}/${row.name}` : row.name
    fullPathCache.set(folderId, full)
    visited.delete(folderId)
    return full
  }

  for (const f of folders) {
    computeFullPath(f.id, new Set<string>())
  }

  // Prepare folder values for batch upsert
  const folderValues = folders.map((f) => {
    const fullPath = fullPathCache.get(f.id) ?? f.name
    const parentFullPath = f.parentFolderId
      ? (fullPathCache.get(f.parentFolderId) ?? '')
      : ''
    return {
      userId,
      nodeType: 'folder',
      nodeId: f.id,
      parentFolderId: f.parentFolderId,
      folderPath: parentFullPath,
      fullPath,
      name: f.name,
      isDeleted: f.isDeleted,
    }
  })

  // Batch insert/update folders (100 per batch)
  const batchSize = 100
  for (let i = 0; i < folderValues.length; i += batchSize) {
    const chunk = folderValues.slice(i, i + batchSize)
    const queries = chunk.map((val) =>
      db
        .insert(storageNodeBtree)
        .values(val)
        .onConflictDoUpdate({
          target: [
            storageNodeBtree.userId,
            storageNodeBtree.nodeType,
            storageNodeBtree.nodeId,
          ],
          set: {
            parentFolderId: val.parentFolderId,
            folderPath: val.folderPath,
            fullPath: val.fullPath,
            name: val.name,
            isDeleted: val.isDeleted,
            updatedAt: new Date(),
          },
        }),
    )
    await db.batch(queries)
  }

  // Fetch all files for the user
  const files = await db
    .select({
      id: file.id,
      name: file.name,
      folderId: file.folderId,
      isDeleted: file.isDeleted,
      sizeInBytes: file.sizeInBytes,
      etag: file.etag,
      lastModified: file.lastModified,
    })
    .from(file)
    .where(eq(file.userId, userId))

  // Prepare file values using computed folder paths
  const fileValues = files.map((f) => {
    const parentFullPath = f.folderId
      ? (fullPathCache.get(f.folderId) ?? '')
      : ''
    const fullPath = joinPath(parentFullPath, f.name)
    return {
      userId,
      nodeType: 'file',
      nodeId: f.id,
      parentFolderId: f.folderId,
      folderPath: parentFullPath,
      fullPath,
      name: f.name,
      isDeleted: f.isDeleted,
      sizeInBytes: f.sizeInBytes,
      etag: f.etag,
      lastModified: f.lastModified,
    }
  })

  // Batch insert/update files
  for (let i = 0; i < fileValues.length; i += batchSize) {
    const chunk = fileValues.slice(i, i + batchSize)
    const queries = chunk.map((val) =>
      db
        .insert(storageNodeBtree)
        .values(val)
        .onConflictDoUpdate({
          target: [
            storageNodeBtree.userId,
            storageNodeBtree.nodeType,
            storageNodeBtree.nodeId,
          ],
          set: {
            parentFolderId: val.parentFolderId,
            folderPath: val.folderPath,
            fullPath: val.fullPath,
            name: val.name,
            isDeleted: val.isDeleted,
            sizeInBytes: val.sizeInBytes,
            etag: val.etag,
            lastModified: val.lastModified,
            updatedAt: new Date(),
          },
        }),
    )
    await db.batch(queries)
  }

  await Cache.set(markerKey, 'done', { expirationTtl: BACKFILL_TTL_SECONDS })
}
