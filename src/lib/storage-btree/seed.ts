import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { file, folder } from '@/db/schema/storage'
import { upsertFileNode, upsertFolderNode } from '@/lib/storage-btree/index'
import type { NodeType } from '@/lib/storage-btree/index'

export async function seedNodeById(
  userId: string,
  nodeType: NodeType,
  nodeId: string,
) {
  if (nodeType === 'folder') {
    const rows = await db
      .select({
        id: folder.id,
        name: folder.name,
        parentFolderId: folder.parentFolderId,
        isDeleted: folder.isDeleted,
      })
      .from(folder)
      .where(and(eq(folder.id, nodeId), eq(folder.userId, userId)))
      .limit(1)
    if (rows[0]) {
      await upsertFolderNode({
        userId,
        folderId: rows[0].id,
        name: rows[0].name,
        parentFolderId: rows[0].parentFolderId,
        isDeleted: rows[0].isDeleted,
      })
    }
    return
  }

  const rows = await db
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
    .where(and(eq(file.id, nodeId), eq(file.userId, userId)))
    .limit(1)
  if (rows[0]) {
    await upsertFileNode({
      userId,
      fileId: rows[0].id,
      name: rows[0].name,
      folderId: rows[0].folderId,
      isDeleted: rows[0].isDeleted,
      sizeInBytes: rows[0].sizeInBytes,
      etag: rows[0].etag,
      lastModified: rows[0].lastModified,
    })
  }
}
