import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { db } from '@/db'
import { folder } from '@/db/schema/storage'
import { withActivityLogging } from '@/lib/activity-logging'

const touchInputSchema = z.object({
  folderId: z.string().min(1),
})

export const touchFolderOpenedFn = createServerFn({ method: 'POST' })
  .inputValidator(touchInputSchema)
  .handler(async ({ data, context }) => {
    const user = await getAuthenticatedUser()
    return withActivityLogging(
      user.id,
      'folder_view',
      {
        resourceType: 'folder',
        resourceId: data.folderId,
        tags: ['Files'],
      },
      async () => {
        const userId = user.id

        await db
          .update(folder)
          .set({ lastOpenedAt: new Date() })
          .where(and(eq(folder.id, data.folderId), eq(folder.userId, userId)))

        return { success: true }
      },
    )
  })
