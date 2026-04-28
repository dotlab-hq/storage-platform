import { db } from '@/db'
import { folder } from '@/db/schema/storage'
import { and, eq, isNull } from 'drizzle-orm'
import { storageNodeBtree } from '@/db/schema/storage-btree'
import { resolveFolderPath, upsertFolderNode } from '@/lib/storage-btree/index'
import { seedNodeById } from '@/lib/storage-btree/seed'

export async function resolveVirtualFolder(
  userId: string,
  rootFolderId: string | null,
  path: string,
): Promise<string | null> {
  const segments = path.split('/').filter(Boolean)
  if (segments.length === 0) {
    return rootFolderId
  }

  let currentFolderId = rootFolderId
  let currentFolderPath = await resolveFolderPath(userId, currentFolderId)

  for (const segment of segments) {
    const parentIdForSegment = currentFolderId
    const btreeRows = await db
      .select({ nodeId: storageNodeBtree.nodeId })
      .from(storageNodeBtree)
      .where(
        and(
          eq(storageNodeBtree.userId, userId),
          eq(storageNodeBtree.nodeType, 'folder'),
          eq(storageNodeBtree.isDeleted, false),
          eq(storageNodeBtree.folderPath, currentFolderPath),
          eq(storageNodeBtree.name, segment),
        ),
      )
      .limit(1)

    if (btreeRows[0]) {
      currentFolderId = btreeRows[0].nodeId
      currentFolderPath = await resolveFolderPath(userId, currentFolderId)
      continue
    }

    const condition = and(
      eq(folder.userId, userId),
      eq(folder.name, segment),
      currentFolderId
        ? eq(folder.parentFolderId, currentFolderId)
        : isNull(folder.parentFolderId),
      eq(folder.isDeleted, false),
      eq(folder.isTrashed, false),
    )

    const rows = await db
      .select({ id: folder.id, parentFolderId: folder.parentFolderId })
      .from(folder)
      .where(condition)
      .limit(1)

    if (rows.length === 0) {
      const inserted = await db
        .insert(folder)
        .values({
          userId,
          name: segment,
          parentFolderId: parentIdForSegment,
          isDeleted: false,
        })
        .returning({ id: folder.id })
      currentFolderId = inserted[0].id
      await upsertFolderNode({
        userId,
        folderId: currentFolderId,
        name: segment,
        parentFolderId: parentIdForSegment,
        isDeleted: false,
      })
    } else {
      currentFolderId = rows[0].id
      await seedNodeById(userId, 'folder', currentFolderId)
    }

    currentFolderPath = await resolveFolderPath(userId, currentFolderId)
  }

  return currentFolderId
}

export function splitObjectKey(objectKey: string): {
  folderPath: string
  fileName: string
  isDirectory: boolean
} {
  const isDirectory = objectKey.endsWith('/')
  const normalizedKey = objectKey.replace(/\/+$/, '')
  const lastSlash = normalizedKey.lastIndexOf('/')

  let folderPath = ''
  let fileName = ''

  if (lastSlash === -1) {
    folderPath = ''
    fileName = normalizedKey
  } else {
    folderPath = normalizedKey.substring(0, lastSlash)
    fileName = normalizedKey.substring(lastSlash + 1)
  }

  if (isDirectory) {
    folderPath = folderPath ? `${folderPath}/${fileName}` : fileName
    fileName = ''
  }

  return { folderPath, fileName, isDirectory }
}
