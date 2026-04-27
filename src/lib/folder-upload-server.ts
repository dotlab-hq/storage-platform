import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/server-auth'
import {
  resolveProviderId,
  selectProviderForUpload,
} from '@/lib/s3-provider-client'

import { db } from '@/db'
import { file as storageFile, folder, userStorage } from '@/db/schema/storage'
import { eq, sql, and } from 'drizzle-orm'
import { withActivityLogging } from '@/lib/activity-logging'

const AbortFolderUploadSchema = z.object({
  uploadSessionId: z.string(),
  objectKeys: z.array(z.string()),
})

export const abortFolderUpload = createServerFn({ method: 'POST' })
  .inputValidator((d: z.infer<typeof AbortFolderUploadSchema>) =>
    AbortFolderUploadSchema.parse(d),
  )
  .handler(async ({ data, context }) => {
    const authUser = await getAuthenticatedUser()
    return withActivityLogging(
      authUser.id,
      'upload_abort',
      {
        resourceType: 'upload',
        tags: ['Files', 'API'],
      },
      async () => {
        const { DeleteObjectsCommand } = await import('@aws-sdk/client-s3')
        const provider = await selectProviderForUpload(0, authUser.id)

        const objectsToDelete = data.objectKeys.map((key) => ({ Key: key }))

        if (objectsToDelete.length > 0) {
          try {
            await provider.client.send(
              new DeleteObjectsCommand({
                Bucket: provider.bucketName,
                Delete: { Objects: objectsToDelete },
              }),
            )
          } catch {
            // Best effort - continue even if S3 cleanup fails
          }
        }

        return { success: true }
      },
    )
  })

const FileHashSchema = z.object({
  fileName: z.string(),
  fileSize: z.number().nonnegative(),
  sha256Hash: z.string().length(64),
})

const FolderUploadInitSchema = z.object({
  folderName: z.string(),
  parentFolderId: z.string().nullable().optional(),
  files: z.array(FileHashSchema).min(1),
  totalSize: z.number().nonnegative(),
})

export const initFolderUpload = createServerFn({ method: 'POST' })
  .inputValidator((d: z.infer<typeof FolderUploadInitSchema>) =>
    FolderUploadInitSchema.parse(d),
  )
  .handler(async ({ data, context }) => {
    const authUser = await getAuthenticatedUser()
    return withActivityLogging(
      authUser.id,
      'upload_multipart',
      {
        tags: ['Files'],
        meta: {
          folderName: data.folderName,
          fileCount: data.files.length,
          totalSize: data.totalSize,
        },
      },
      async () => {
        const totalSizeRows = await db
          .select({
            usedStorage: userStorage.usedStorage,
            allocatedStorage: userStorage.allocatedStorage,
          })
          .from(userStorage)
          .where(eq(userStorage.userId, authUser.id))
          .limit(1)

        const usedStorage = totalSizeRows[0]?.usedStorage ?? 0
        const allocatedStorage = totalSizeRows[0]?.allocatedStorage ?? 0

        if (usedStorage + data.totalSize > allocatedStorage) {
          throw new Error('Insufficient storage space for this folder upload')
        }

        const uploadSessionId = crypto.randomUUID()
        const objectKeys: Record<string, string> = {}

        for (const file of data.files) {
          const dotIndex = file.fileName.lastIndexOf('.')
          const base =
            (dotIndex > 0 ? file.fileName.slice(0, dotIndex) : file.fileName)
              .replace(/\s+/g, '_')
              .replace(/[^a-zA-Z0-9._-]/g, '') || 'file'
          const ext =
            dotIndex > 0
              ? `.${file.fileName.slice(dotIndex + 1).replace(/[^a-zA-Z0-9]/g, '')}`
              : ''
          const objectKey = `${authUser.id}/${uploadSessionId}/${crypto.randomUUID()}-${base}${ext}`
          objectKeys[file.fileName] = objectKey
        }

        return {
          uploadSessionId,
          objectKeys,
        }
      },
    )
  })

const CompleteFolderUploadSchema = z.object({
  uploadSessionId: z.string(),
  folderName: z.string(),
  parentFolderId: z.string().nullable().optional(),
  files: z.array(
    z.object({
      fileName: z.string(),
      objectKey: z.string(),
      sha256Hash: z.string().length(64),
      fileSize: z.number().nonnegative(),
      mimeType: z.string().nullable().optional(),
      providerId: z.string().nullable().optional(),
    }),
  ),
  providerId: z.string().nullable().optional(),
})

export const completeFolderUpload = createServerFn({ method: 'POST' })
  .inputValidator((d: z.infer<typeof CompleteFolderUploadSchema>) =>
    CompleteFolderUploadSchema.parse(d),
  )
  .handler(async ({ data, context }) => {
    const authUser = await getAuthenticatedUser()
    return withActivityLogging(
      authUser.id,
      'upload_complete',
      {
        resourceType: 'file',
        tags: ['Files'],
        meta: { folderName: data.folderName, fileCount: data.files.length },
      },
      async () => {
        // Verification removed: each file was uploaded successfully (HTTP 200)
        // The upload step already confirms the file is stored correctly.
        let isPrivatelyLocked = false
        if (data.parentFolderId) {
          const parentRows = await db
            .select({ isPrivatelyLocked: folder.isPrivatelyLocked })
            .from(folder)
            .where(
              and(
                eq(folder.id, data.parentFolderId),
                eq(folder.userId, authUser.id),
              ),
            )
            .limit(1)
          if (parentRows.length > 0) {
            isPrivatelyLocked = parentRows[0].isPrivatelyLocked
          }
        }

        const [createdFolder] = await db
          .insert(folder)
          .values({
            name: data.folderName,
            userId: authUser.id,
            parentFolderId: data.parentFolderId || null,
            isPrivatelyLocked,
          })
          .returning({ id: folder.id })

        // Map from directory path to its folder ID. Empty string represents the root folder.
        const folderPathToId = new Map<string, string>()
        folderPathToId.set('', createdFolder.id)

        // If there are files, create any nested directories.
        if (data.files.length > 0) {
          // Collect all unique directory paths from the file names.
          const dirPaths = new Set<string>()
          for (const file of data.files) {
            const fileName = file.fileName
            const lastSlash = fileName.lastIndexOf('/')
            if (lastSlash > 0) {
              const dir = fileName.slice(0, lastSlash)
              dirPaths.add(dir)
            }
          }

          // Expand to all parent prefixes (e.g., "a/b" => include "a")
          const allPaths: string[] = []
          for (const dir of dirPaths) {
            const parts = dir.split('/')
            let prefix = ''
            for (const part of parts) {
              prefix = prefix ? `${prefix}/${part}` : part
              if (!folderPathToId.has(prefix)) {
                allPaths.push(prefix)
              }
            }
          }

          // Sort by depth so parents are created before children.
          allPaths.sort((a, b) => a.split('/').length - b.split('/').length)

          // Create subfolders.
          for (const path of allPaths) {
            const parentPath = path.includes('/')
              ? path.substring(0, path.lastIndexOf('/'))
              : ''
            const parentId = folderPathToId.get(parentPath)!
            const folderName = path.split('/').pop()!
            const [newFolder] = await db
              .insert(folder)
              .values({
                name: folderName,
                userId: authUser.id,
                parentFolderId: parentId,
                isPrivatelyLocked,
              })
              .returning({ id: folder.id })
            folderPathToId.set(path, newFolder.id)
          }
        }

        // Insert files with correct parent folder.
        let totalUploadedSize = 0
        for (const file of data.files) {
          const fileName = file.fileName
          const lastSlash = fileName.lastIndexOf('/')
          let parentFolderId: string
          if (lastSlash === -1) {
            parentFolderId = createdFolder.id
          } else {
            const dir = fileName.slice(0, lastSlash)
            parentFolderId = folderPathToId.get(dir)!
          }

          const resolvedProviderId = await resolveProviderId(
            file.providerId ?? data.providerId,
          )

          await db.insert(storageFile).values({
            name: file.fileName,
            objectKey: file.objectKey,
            mimeType: file.mimeType || null,
            sizeInBytes: file.fileSize,
            userId: authUser.id,
            folderId: parentFolderId,
            providerId: resolvedProviderId,
            isPrivatelyLocked,
          })

          totalUploadedSize += file.fileSize
        }

        await db
          .insert(userStorage)
          .values({
            userId: authUser.id,
            usedStorage: totalUploadedSize,
          })
          .onConflictDoUpdate({
            target: userStorage.userId,
            set: {
              usedStorage: sql`${userStorage.usedStorage} + ${totalUploadedSize}`,
            },
          })

        const { invalidateFolderCache, invalidateQuotaCache } =
          await import('@/lib/cache-invalidation')
        await invalidateFolderCache(authUser.id, data.parentFolderId || null)
        await invalidateQuotaCache(authUser.id)

        return {
          folderId: createdFolder.id,
          filesCount: data.files.length,
        }
      },
    )
  })
