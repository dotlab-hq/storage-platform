import { eq } from 'drizzle-orm'
import { Cache } from '@/lib/Cache'
import { db } from '@/db'
import { file, folder } from '@/db/schema/storage'
import { joinPath } from '@/lib/storage-btree/path'
import { upsertFileNode, upsertFolderNode } from '@/lib/storage-btree/index'

const BACKFILL_TTL_SECONDS = 10 * 60

type FolderRow = {
  id: string
  name: string
  parentFolderId: string | null
  isDeleted: boolean
}

export async function backfillStorageBtree(userId: string): Promise<void> {
  const markerKey = `btree:backfill:${userId}`
  const marker = await Cache.get<string>(markerKey)
  if (marker === 'done') {
    return
  }

  const folders = await db
    .select({
      id: folder.id,
      name: folder.name,
      parentFolderId: folder.parentFolderId,
      isDeleted: folder.isDeleted,
    })
    .from(folder)
    .where(eq(folder.userId, userId))

  const pathMap = new Map<string, string>()
  const byId = new Map<string, FolderRow>()
  folders.forEach((entry) => byId.set(entry.id, entry))

  function resolvePath(folderId: string, visited: Set<string>): string {
    const cached = pathMap.get(folderId)
    if (cached !== undefined) return cached
    const row = byId.get(folderId)
    if (!row) return ''
    if (visited.has(folderId)) return row.name
    visited.add(folderId)
    const parentPath = row.parentFolderId
      ? resolvePath(row.parentFolderId, visited)
      : ''
    const fullPath = joinPath(parentPath, row.name)
    pathMap.set(folderId, fullPath)
    visited.delete(folderId)
    return fullPath
  }

  for (const entry of folders) {
    resolvePath(entry.id, new Set<string>())
    await upsertFolderNode({
      userId,
      folderId: entry.id,
      name: entry.name,
      parentFolderId: entry.parentFolderId,
      isDeleted: entry.isDeleted,
    })
  }

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

  for (const entry of files) {
    await upsertFileNode({
      userId,
      fileId: entry.id,
      name: entry.name,
      folderId: entry.folderId,
      isDeleted: entry.isDeleted,
      sizeInBytes: entry.sizeInBytes,
      etag: entry.etag,
      lastModified: entry.lastModified,
    })
  }

  await Cache.set(markerKey, 'done', { expirationTtl: BACKFILL_TTL_SECONDS })
}
