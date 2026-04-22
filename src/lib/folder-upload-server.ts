import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/server-auth'
import {
  resolveProviderId,
  getProviderClientById,
} from '@/lib/s3-provider-client'
import { DEFAULT_FILE_SIZE_LIMIT_BYTES } from '@/lib/storage-quota-constants'
import { db } from '@/db'
import { file as storageFile, folder, userStorage } from '@/db/schema/storage'
import { eq, sql, and } from 'drizzle-orm'

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
  .handler(async ({ data }) => {
    const authUser = await getAuthenticatedUser()

    const storageRows = await db
      .select({ fileSizeLimit: userStorage.fileSizeLimit })
      .from(userStorage)
      .where(eq(userStorage.userId, authUser.id))
      .limit(1)
    const fileSizeLimit =
      storageRows[0]?.fileSizeLimit ?? DEFAULT_FILE_SIZE_LIMIT_BYTES

    for (const file of data.files) {
      if (file.fileSize > fileSizeLimit) {
        throw new Error(
          `File "${file.fileName}" exceeds maximum allowed size (${fileSizeLimit} bytes)`,
        )
      }
    }

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
    }),
  ),
  providerId: z.string().nullable().optional(),
})

export const completeFolderUpload = createServerFn({ method: 'POST' })
  .inputValidator((d: z.infer<typeof CompleteFolderUploadSchema>) =>
    CompleteFolderUploadSchema.parse(d),
  )
  .handler(async ({ data }) => {
    const authUser = await getAuthenticatedUser()

    const [{ HeadObjectCommand }] = await Promise.all([
      import('@aws-sdk/client-s3'),
    ])

    const provider = await getProviderClientById(data.providerId ?? null)

    for (const file of data.files) {
      try {
        const response = await provider.client.send(
          new HeadObjectCommand({
            Bucket: provider.bucketName,
            Key: file.objectKey,
          }),
        )

        const contentLength = response.ContentLength ?? 0
        if (contentLength !== file.fileSize) {
          throw new Error(
            `File size mismatch for "${file.fileName}": expected ${file.fileSize}, got ${contentLength}`,
          )
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        throw new Error(
          `Hash verification failed for "${file.fileName}": ${message}`,
        )
      }
    }

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

    let totalUploadedSize = 0

    for (const file of data.files) {
      const resolvedProviderId = await resolveProviderId(data.providerId)

      await db.insert(storageFile).values({
        name: file.fileName,
        objectKey: file.objectKey,
        mimeType: file.mimeType || null,
        sizeInBytes: file.fileSize,
        userId: authUser.id,
        folderId: createdFolder.id,
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
  })
