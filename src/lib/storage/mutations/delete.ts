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

          // Move to trash: set isTrashed = true, isDeleted = false
          await db
            .update(storageFile)
            .set({ isTrashed: true, isDeleted: false })
            .where(
              and(
                inArray(storageFile.id, fileIds),
                eq(storageFile.userId, userId),
                eq(storageFile.isTrashed, false),
                eq(storageFile.isDeleted, false),
              ),
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

          // Move to trash: set isTrashed = true, isDeleted = false
          await db
            .update(folder)
            .set({ isTrashed: true, isDeleted: false })
            .where(
              and(
                inArray(folder.id, folderIds),
                eq(folder.userId, userId),
                eq(folder.isTrashed, false),
                eq(folder.isDeleted, false),
              ),
            )

          await Promise.all(
            folderIds.map((id) => seedNodeById(userId, 'folder', id)),
          )
        }

        const { patchFolderCache } = await import('@/lib/cache-invalidation')
        for (const parentId of Array.from(distinctParents)) {
          await patchFolderCache(userId, parentId, {
            removeFolderIds: folderIds,
            removeFileIds: fileIds,
          })
        }

        return {
          trashedFiles: fileIds.length,
          trashedFolders: folderIds.length,
        }
      },
    )
  })
