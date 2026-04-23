import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, and, inArray } from 'drizzle-orm'
import { getAuthenticatedUser, requireWritePermission } from '@/lib/server-auth'
import { db } from '@/db'
import { folder, file as storageFile } from '@/db/schema/storage'
import { withActivityLogging } from '@/lib/activity-logging'
import { markFolderSubtreeDeleted } from '@/lib/storage-btree/index'
import { seedNodeById } from '@/lib/storage-btree/seed'

const DeleteItemsSchema = z.object({
  itemIds: z.array(z.string().min(1)),
  itemTypes: z.array(z.enum(['file', 'folder'])),
})

export const deleteItemsFn = createServerFn({ method: 'POST' })
  .inputValidator(DeleteItemsSchema)
  .handler(async ({ data, context }) => {
    const user = await getAuthenticatedUser()
    return withActivityLogging(
      user.id,
      'file_delete',
      {
        tags: ['Files', 'Trash'],
        meta: { count: data.itemIds.length },
      },
      async () => {
        requireWritePermission(user)
        const { itemIds, itemTypes } = data
        const userId = user.id

        if (itemIds.length !== itemTypes.length) {
          throw new Error('Mismatched item ids and types array lengths')
        }

        const now = new Date()
        const fileIds: string[] = []
        const folderIds: string[] = []
        for (let i = 0; i < itemIds.length; i++) {
          if (itemTypes[i] === 'file') fileIds.push(itemIds[i])
          else folderIds.push(itemIds[i])
        }

        const distinctParents = new Set<string | null>()

        if (fileIds.length > 0) {
          const files = await db
            .select({ folderId: storageFile.folderId })
            .from(storageFile)
            .where(inArray(storageFile.id, fileIds))
          files.forEach((f) => distinctParents.add(f.folderId))

          await db
            .update(storageFile)
            .set({ isDeleted: true, deletedAt: now })
            .where(
              and(
                inArray(storageFile.id, fileIds),
                eq(storageFile.userId, userId),
              ),
            )

          await Promise.all(
            fileIds.map((id) => seedNodeById(userId, 'file', id)),
          )
        }

        if (folderIds.length > 0) {
          const allFolderIds: string[] = [...folderIds]
          const visitedFolderIds = new Set<string>(folderIds)
          let toProcess: string[] = [...folderIds]
          let depth = 0

          while (toProcess.length > 0) {
            const children = await db
              .select({ id: folder.id })
              .from(folder)
              .where(
                and(
                  eq(folder.userId, userId),
                  inArray(folder.parentFolderId, toProcess),
                ),
              )
            const childIds = children
              .map((c) => c.id)
              .filter((childId) => {
                if (visitedFolderIds.has(childId)) {
                  return false
                }
                visitedFolderIds.add(childId)
                return true
              })

            if (childIds.length === 0) {
              break
            }

            allFolderIds.push(...childIds)
            toProcess = childIds
            depth += 1

            if (depth > 1024) {
              throw new Error('Folder deletion traversal exceeded safe depth')
            }
          }

          await db
            .update(folder)
            .set({ isDeleted: true, deletedAt: now })
            .where(
              and(inArray(folder.id, allFolderIds), eq(folder.userId, userId)),
            )

          await db
            .update(storageFile)
            .set({ isDeleted: true, deletedAt: now })
            .where(
              and(
                inArray(storageFile.folderId, allFolderIds),
                eq(storageFile.userId, userId),
              ),
            )

          for (const folderId of folderIds) {
            await seedNodeById(userId, 'folder', folderId)
            await markFolderSubtreeDeleted(userId, folderId, true)
          }
        }

        const { patchFolderCache, invalidateQuotaCache } =
          await import('@/lib/cache-invalidation')
        await invalidateQuotaCache(userId)

        if (folderIds.length > 0) {
          const folders = await db
            .select({ parentFolderId: folder.parentFolderId })
            .from(folder)
            .where(inArray(folder.id, folderIds))
          folders.forEach((f) => distinctParents.add(f.parentFolderId))
        }

        for (const parentId of Array.from(distinctParents)) {
          await patchFolderCache(userId, parentId, {
            removeFolderIds: folderIds,
            removeFileIds: fileIds,
          })
        }

        return {
          deletedFiles: fileIds.length,
          deletedFolders: folderIds.length,
        }
      },
    )
  })
