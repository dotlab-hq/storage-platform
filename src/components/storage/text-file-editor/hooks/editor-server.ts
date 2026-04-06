import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { saveTextFileFn as contentSaveTextFileFn } from '@/lib/storage/mutations/content'
import { db } from '@/db'
import { file as storageFile } from '@/db/schema/storage'
import { eq, and } from 'drizzle-orm'
import type { SaveFileResponse } from '../types'

const SaveEditorFileSchema = z.object({
  fileId: z.string().nullable().optional(),
  fileName: z.string().min(1),
  content: z.string(),
  parentFolderId: z.string().nullable().optional(),
})

export const saveTextFileFn = createServerFn({ method: 'POST' })
  .inputValidator(SaveEditorFileSchema)
  .handler(async ({ data }): Promise<SaveFileResponse> => {
    try {
      const user = await getAuthenticatedUser()

      const fileId = data.fileId ?? ''
      await contentSaveTextFileFn({
        data: {
          fileId,
          name: data.fileName,
          content: data.content,
        },
      })

      // Fetch the updated file to return proper data for the UI
      const fileRows = await db
        .select()
        .from(storageFile)
        .where(and(eq(storageFile.id, fileId), eq(storageFile.userId, user.id)))
        .limit(1)

      if (fileRows.length === 0) {
        throw new Error('File not found after saving')
      }

      const fileData = fileRows[0]

      return {
        file: {
          id: fileData.id,
          name: fileData.name,
          objectKey: fileData.objectKey,
          mimeType: fileData.mimeType,
          sizeInBytes: fileData.sizeInBytes,
          createdAt: fileData.createdAt.toISOString(),
          folderId: fileData.folderId,
        },
      }
    } catch (error) {
      console.error('[Server] Text file save error:', error)
      return { error: error instanceof Error ? error.message : String(error) }
    }
  })
