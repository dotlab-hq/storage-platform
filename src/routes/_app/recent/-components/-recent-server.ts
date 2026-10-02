import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { apiAuthMiddleware } from '@/middlewares/api-auth'
import { getFilePresignedUrlFn } from '@/lib/storage/mutations/urls'
import { getRecentDriveItems } from './-recent-queries'

const RecentFileInputSchema = z.object({
  fileId: z.string().min(1),
})

export type RecentItem = {
  id: string
  name: string
  lastOpenedAt: string
  kind: 'file' | 'folder'
  mimeType: string | null
}

/** Folders and files the signed-in user opened or created in the last 24h, newest first. */
export const getRecentSnapshotFn = createServerFn({ method: 'GET' })
  .middleware([apiAuthMiddleware])
  .handler(async ({ context }) => {
    const currentUser = context.user
    const recent = await getRecentDriveItems(currentUser.id)

    const items: RecentItem[] = [
      ...recent.folders.map((folder) => ({
        id: folder.id,
        name: folder.name,
        lastOpenedAt: (folder.lastOpenedAt ?? folder.createdAt).toISOString(),
        kind: 'folder' as const,
        mimeType: null,
      })),
      ...recent.files.map((file) => ({
        id: file.id,
        name: file.name,
        lastOpenedAt: (file.lastOpenedAt ?? file.createdAt).toISOString(),
        kind: 'file' as const,
        mimeType: file.mimeType,
      })),
    ].sort(
      (left, right) =>
        new Date(right.lastOpenedAt).getTime() -
        new Date(left.lastOpenedAt).getTime(),
    )

    return { items }
  })

/** A short-lived URL for opening one of the user's files. */
export const getRecentFileUrlFn = createServerFn({ method: 'GET' })
  .middleware([apiAuthMiddleware])
  .inputValidator(RecentFileInputSchema)
  .handler(async ({ data }) => {
    const result = await getFilePresignedUrlFn({
      data: { fileId: data.fileId },
    })
    if (typeof result.url !== 'string') {
      throw new Error('Failed to generate presigned URL')
    }
    return { url: result.url }
  })
