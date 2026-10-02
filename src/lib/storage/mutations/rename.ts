import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { requireWritePermission } from '@/lib/server-auth.server'
import { apiAuthMiddleware } from '@/middlewares/api-auth'
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
  .middleware([apiAuthMiddleware])
  .inputValidator(RenameItemSchema)
  .handler(async ({ data, context }) => {
    const { user } = context
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
          const updatedRows = await db
            .update(folder)
            .set({ name: newName })
            .where(and(eq(folder.id, itemId), eq(folder.userId, user.id)))
            .returning({
              id: folder.id,
              name: folder.name,
              parentFolderId: folder.parentFolderId,
            })
          const updated = updatedRows.at(0)
          parentFolderId = updated?.parentFolderId ?? null
          if (updated?.id) {
            await seedNodeById(user.id, 'folder', updated.id)
          }
        } else {
          const updatedRows = await db
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
          const updated = updatedRows.at(0)
          parentFolderId = updated?.folderId ?? null
          if (updated?.id) {
            await seedNodeById(user.id, 'file', updated.id)
          }
        }

        return { id: itemId, name: newName }
      },
    )
  })
