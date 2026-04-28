import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, and, inArray } from 'drizzle-orm'
import {
  getAuthenticatedUser,
  requireWritePermission,
} from '@/lib/server-auth.server'
import { db } from '@/db'
import { folder, file as storageFile } from '@/db/schema/storage'
import { withActivityLogging } from '@/lib/activity-logging'
import { seedNodeById } from '@/lib/storage-btree/seed'
import { getTrashDeletionQueueFromRequestContext } from '@/lib/trash-deletion/request-context'
import {
  enqueueTrashDeletionItems,
  markItemsDeleted,
} from '@/lib/trash-deletion/producer'

const DeleteItemsSchema = z.object({
  itemIds: z.array(z.string().min(1)),
  itemTypes: z.array(z.enum(['file', 'folder'])),
})

export const deleteItemsFn = createServerFn({ method: 'POST' })
  .inputValidator(DeleteItemsSchema)
  .handler(async ({ data }) => {
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

          await markItemsDeleted(
            userId,
            fileIds.map((id) => ({ userId, itemId: id, itemType: 'file' as const })),
          )

          await Promise.all(
            fileIds.map((id) => seedNodeById(userId, 'file', id)),
          )
        }

        if (folderIds.length > 0) {
          // Get parent folders for cache invalidation
          const folders = await db
            .select({ parentFolderId: folder.parentFolderId })
            .from(folder)
            .where(
              and(inArray(folder.id, folderIds), eq(folder.userId, userId)),
            )
          folders.forEach((f) => distinctParents.add(f.parentFolderId))

          await markItemsDeleted(
            userId,
            folderIds.map((id) => ({
              userId,
              itemId: id,
              itemType: 'folder' as const,
            })),
          )

          await Promise.all(
            folderIds.map((id) => seedNodeById(userId, 'folder', id)),
          )
        }

        const { patchFolderCache, invalidateQuotaCache } =
          await import('@/lib/cache-invalidation')
        await invalidateQuotaCache(userId)

        for (const parentId of Array.from(distinctParents)) {
          await patchFolderCache(userId, parentId, {
            removeFolderIds: folderIds,
            removeFileIds: fileIds,
          })
        }

        const queue = getTrashDeletionQueueFromRequestContext()
        const queued = await enqueueTrashDeletionItems(queue, [
          ...fileIds.map((id) => ({ userId, itemId: id, itemType: 'file' as const })),
          ...folderIds.map((id) => ({
            userId,
            itemId: id,
            itemType: 'folder' as const,
          })),
        ])

        return {
          deletedFiles: fileIds.length,
          deletedFolders: folderIds.length,
          queuedItems: queued,
        }
      },
    )
  })
