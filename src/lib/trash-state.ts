import { and, eq, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { file, folder } from '@/db/schema/storage'
import { seedNodeById } from '@/lib/storage-btree/seed'

const CHUNK_SIZE = 90

export type DeletionScheduleResult = {
  fileIds: string[]
  folderIds: string[]
}

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids)]
}

function chunks(ids: string[]): string[][] {
  const result: string[][] = []
  for (let index = 0; index < ids.length; index += CHUNK_SIZE) {
    result.push(ids.slice(index, index + CHUNK_SIZE))
  }
  return result
}

async function collectFolderSubtreeIds(
  userId: string,
  rootFolderIds: string[],
): Promise<DeletionScheduleResult> {
  const folderIds = uniqueIds(rootFolderIds)
  const fileIds: string[] = []
  let frontier = folderIds

  while (frontier.length > 0) {
    const nextFrontier: string[] = []

    for (const chunk of chunks(frontier)) {
      const [childFiles, childFolders] = await Promise.all([
        db
          .select({ id: file.id })
          .from(file)
          .where(and(eq(file.userId, userId), inArray(file.folderId, chunk))),
        db
          .select({ id: folder.id })
          .from(folder)
          .where(
            and(
              eq(folder.userId, userId),
              inArray(folder.parentFolderId, chunk),
            ),
          ),
      ])

      fileIds.push(...childFiles.map((row) => row.id))
      nextFrontier.push(...childFolders.map((row) => row.id))
    }

    const newFolderIds = nextFrontier.filter((id) => !folderIds.includes(id))
    folderIds.push(...newFolderIds)
    frontier = newFolderIds
  }

  return { fileIds: uniqueIds(fileIds), folderIds }
}

export async function markFilesForDeletionSchedule(
  userId: string,
  fileIds: string[],
  deletedAt: Date = new Date(),
): Promise<string[]> {
  const uniqueFileIds = uniqueIds(fileIds)

  for (const chunk of chunks(uniqueFileIds)) {
    await db
      .update(file)
      .set({
        isTrashed: true,
        isDeleted: true,
        deletedAt,
        deletionQueuedAt: null,
        updatedAt: deletedAt,
      })
      .where(and(eq(file.userId, userId), inArray(file.id, chunk)))
  }

  await Promise.all(uniqueFileIds.map((id) => seedNodeById(userId, 'file', id)))

  return uniqueFileIds
}

export async function markFolderSubtreesForDeletionSchedule(
  userId: string,
  rootFolderIds: string[],
  deletedAt: Date = new Date(),
): Promise<DeletionScheduleResult> {
  const result = await collectFolderSubtreeIds(userId, rootFolderIds)

  for (const chunk of chunks(result.folderIds)) {
    await db
      .update(folder)
      .set({
        isTrashed: true,
        isDeleted: true,
        deletedAt,
        deletionQueuedAt: null,
        updatedAt: deletedAt,
      })
      .where(and(eq(folder.userId, userId), inArray(folder.id, chunk)))
  }

  await markFilesForDeletionSchedule(userId, result.fileIds, deletedAt)
  await Promise.all(
    result.folderIds.map((id) => seedNodeById(userId, 'folder', id)),
  )

  return result
}
