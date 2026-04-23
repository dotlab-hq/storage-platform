import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { getAuthenticatedUser, requireWritePermission } from '@/lib/server-auth'
import { db } from '@/db'
import { folder, file as storageFile } from '@/db/schema/storage'
import { withActivityLogging } from '@/lib/activity-logging'
import { seedNodeById } from '@/lib/storage-btree/seed'

const RenameItemSchema = z.object({
  itemId: z.string().min(1),
  newName: z.string().min(1),
  itemType: z.enum(['file', 'folder']),
})

export const renameItemFn = createServerFn({ method: 'POST' })
  .inputValidator(RenameItemSchema)
  .handler(async ({ data, context }) => {
    const user = await getAuthenticatedUser()
    return withActivityLogging(
      user.id,
      data.itemType === 'folder' ? 'folder_rename' : 'file_rename',
      {
        resourceType: data.itemType,
        resourceId: data.itemId,
        tags: ['Files'],
        meta: { newName: data.newName },
      },
      async () => {
        requireWritePermission(user)
        const { itemId, newName, itemType } = data
        let parentFolderId: string | null = null

        if (itemType === 'folder') {
          const [updated] = await db
            .update(folder)
            .set({ name: newName })
            .where(and(eq(folder.id, itemId), eq(folder.userId, user.id)))
            .returning({
              id: folder.id,
              name: folder.name,
              parentFolderId: folder.parentFolderId,
            })
          parentFolderId = updated?.parentFolderId ?? null
          if (updated?.id) {
            await seedNodeById(user.id, 'folder', updated.id)
          }
        } else {
          const [updated] = await db
            .update(storageFile)
            .set({ name: newName })
            .where(
              and(eq(storageFile.id, itemId), eq(storageFile.userId, user.id)),
            )
            .returning({
              id: storageFile.id,
              name: storageFile.name,
              folderId: storageFile.folderId,
            })
          parentFolderId = updated?.folderId ?? null
          if (updated?.id) {
            await seedNodeById(user.id, 'file', updated.id)
          }
        }

        const { patchFolderCache } = await import('@/lib/cache-invalidation')
        await patchFolderCache(user.id, parentFolderId, {
          renameFolder:
            itemType === 'folder' ? { id: itemId, name: newName } : undefined,
          renameFile:
            itemType === 'file' ? { id: itemId, name: newName } : undefined,
        })

        return { id: itemId, name: newName }
      },
    )
  })
