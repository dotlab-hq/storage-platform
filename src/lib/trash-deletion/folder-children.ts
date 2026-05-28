import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { file, folder } from '@/db/schema/storage'
import { getTrashDeletionDO } from './do-client'
import type { QueueClient } from './do-client'

type ChildRow = {
  id: string
  deletionQueuedAt: Date | null
}

export type FolderChildQueueResult = {
  totalChildren: number
  queuedChildren: number
}

async function sendChild(
  queue: QueueClient,
  userId: string,
  itemId: string,
  itemType: 'file' | 'folder',
): Promise<void> {
  await queue.send(JSON.stringify({ userId, itemId, itemType }))
}

export async function markAndQueueFolderChildren(
  env: Env,
  userId: string,
  folderId: string,
): Promise<FolderChildQueueResult> {
  const [childFiles, childFolders] = await Promise.all([
    db
      .select({ id: file.id, deletionQueuedAt: file.deletionQueuedAt })
      .from(file)
      .where(and(eq(file.folderId, folderId), eq(file.userId, userId))),
    db
      .select({ id: folder.id, deletionQueuedAt: folder.deletionQueuedAt })
      .from(folder)
      .where(
        and(eq(folder.parentFolderId, folderId), eq(folder.userId, userId)),
      ),
  ])

  const totalChildren = childFiles.length + childFolders.length
  if (totalChildren === 0) {
    return { totalChildren: 0, queuedChildren: 0 }
  }

  const childFileIds = childFiles.map((child) => child.id)
  const childFolderIds = childFolders.map((child) => child.id)
  const now = new Date()

  await Promise.all([
    db
      .update(file)
      .set({
        isTrashed: true,
        isDeleted: true,
        deletedAt: now,
        updatedAt: now,
      })
      .where(and(eq(file.folderId, folderId), eq(file.userId, userId))),
    db
      .update(folder)
      .set({
        isTrashed: true,
        isDeleted: true,
        deletedAt: now,
        updatedAt: now,
      })
      .where(
        and(eq(folder.parentFolderId, folderId), eq(folder.userId, userId)),
      ),
  ])

  const trashDO = await getTrashDeletionDO(env)
  await trashDO.enqueueChildrenForFolder(folderId, childFileIds, childFolderIds)

  const unqueuedFiles = childFiles.filter(isUnqueued)
  const unqueuedFolders = childFolders.filter(isUnqueued)
  const queuedAt = new Date()

  await Promise.all([
    ...unqueuedFiles.map((child) =>
      db
        .update(file)
        .set({ deletionQueuedAt: queuedAt, updatedAt: queuedAt })
        .where(and(eq(file.id, child.id), eq(file.userId, userId))),
    ),
    ...unqueuedFolders.map((child) =>
      db
        .update(folder)
        .set({ deletionQueuedAt: queuedAt, updatedAt: queuedAt })
        .where(and(eq(folder.id, child.id), eq(folder.userId, userId))),
    ),
  ])

  await Promise.all([
    ...unqueuedFiles.map((child) =>
      sendChild(env.TRASH_DELETION_QUEUE, userId, child.id, 'file'),
    ),
    ...unqueuedFolders.map((child) =>
      sendChild(env.TRASH_DELETION_QUEUE, userId, child.id, 'folder'),
    ),
  ])

  return {
    totalChildren,
    queuedChildren: unqueuedFiles.length + unqueuedFolders.length,
  }
}

function isUnqueued(row: ChildRow): boolean {
  return row.deletionQueuedAt === null
}
