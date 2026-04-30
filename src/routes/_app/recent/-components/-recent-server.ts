import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/server-auth.server'
import { getFilePresignedUrlFn } from '@/lib/storage/mutations/urls'
import { getRecentItems } from '@/lib/storage-queries'

const RecentFileInputSchema = z.object({
  fileId: z.string().min(1),
})

type RecentSnapshotItem = {
  id: string
  name: string
  lastOpenedAt: string
  kind: 'file' | 'folder'
  mimeType: string | null
}

export const getRecentSnapshotFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const currentUser = await getAuthenticatedUser()
    const recent = await getRecentItems(currentUser.id)

    const items: RecentSnapshotItem[] = [
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
  },
)

export const getRecentFileUrlFn = createServerFn({ method: 'GET' })
  .inputValidator(RecentFileInputSchema)
  .handler(async ({ data }) => {
    const result = await getFilePresignedUrlFn({
      data: { fileId: data.fileId },
    })
    if (!result || typeof result.url !== 'string') {
      throw new Error('Failed to generate presigned URL')
    }
    return { url: result.url }
  })
