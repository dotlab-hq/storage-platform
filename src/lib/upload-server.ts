import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/server-auth'
import {
  selectProviderForUpload,
  resolveProviderId,
  getProviderClientById,
} from '@/lib/s3-provider-client'
import { DEFAULT_FILE_SIZE_LIMIT_BYTES } from '@/lib/storage-quota-constants'

const PresignInputSchema = z.object({
  objectKey: z.string(),
  contentType: z.string(),
  fileSize: z.number().positive(),
})

export const uploadPresign = createServerFn({ method: 'POST' })
  .inputValidator((d: z.infer<typeof PresignInputSchema>) =>
    PresignInputSchema.parse(d),
  )
  .handler(async ({ data }) => {
    const authUser = await getAuthenticatedUser()

    const [{ db }, { userStorage }] = await Promise.all([
      import('@/db'),
      import('@/db/schema/storage'),
    ])
    const { eq } = await import('drizzle-orm')

    const storageRows = await db
      .select({ fileSizeLimit: userStorage.fileSizeLimit })
      .from(userStorage)
      .where(eq(userStorage.userId, authUser.id))
      .limit(1)
    const fileSizeLimit =
      storageRows[0]?.fileSizeLimit ?? DEFAULT_FILE_SIZE_LIMIT_BYTES

    if (data.fileSize > fileSizeLimit) {
      throw new Error(
        `File exceeds your maximum allowed size (${fileSizeLimit} bytes)`,
      )
    }

    const { PutObjectCommand } = await import('@aws-sdk/client-s3')
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')
    const provider = await selectProviderForUpload(data.fileSize)

    const command = new PutObjectCommand({
      Bucket: provider.bucketName,
      Key: data.objectKey,
      ContentType: data.contentType,
    })

    const presignedUrl = await getSignedUrl(provider.client, command, {
      expiresIn: 3600,
    })

    return { presignedUrl, providerId: provider.providerId }
  })

const MultipartInitSchema = z.object({
  objectKey: z.string(),
  contentType: z.string(),
  fileSize: z.number().positive(),
  partCount: z.number().int().positive().max(10000),
  providerId: z.string().nullable().optional(),
})

export const uploadMultipartInit = createServerFn({ method: 'POST' })
  .inputValidator((d: z.infer<typeof MultipartInitSchema>) =>
    MultipartInitSchema.parse(d),
  )
  .handler(async ({ data }) => {
    const authUser = await getAuthenticatedUser()

    const [{ db }, { userStorage }] = await Promise.all([
      import('@/db'),
      import('@/db/schema/storage'),
    ])
    const { eq } = await import('drizzle-orm')

    const storageRows = await db
      .select({ fileSizeLimit: userStorage.fileSizeLimit })
      .from(userStorage)
      .where(eq(userStorage.userId, authUser.id))
      .limit(1)
    const fileSizeLimit =
      storageRows[0]?.fileSizeLimit ?? DEFAULT_FILE_SIZE_LIMIT_BYTES

    if (data.fileSize > fileSizeLimit) {
      throw new Error(
        `File exceeds your maximum allowed size (${fileSizeLimit} bytes)`,
      )
    }

    const { CreateMultipartUploadCommand, UploadPartCommand } =
      await import('@aws-sdk/client-s3')
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')
    const provider = await getProviderClientById(data.providerId ?? null)

    const createMultipartResult = await provider.client.send(
      new CreateMultipartUploadCommand({
        Bucket: provider.bucketName,
        Key: data.objectKey,
        ContentType: data.contentType,
      }),
    )

    const uploadId = createMultipartResult.UploadId
    if (!uploadId) {
      throw new Error('Failed to create multipart upload session')
    }

    const presignedPartUrls = await Promise.all(
      Array.from({ length: data.partCount }, async (_, index) => {
        const partNumber = index + 1
        const command = new UploadPartCommand({
          Bucket: provider.bucketName,
          Key: data.objectKey,
          UploadId: uploadId,
          PartNumber: partNumber,
        })
        const presignedUrl = await getSignedUrl(provider.client, command, {
          expiresIn: 3600,
        })
        return { partNumber, presignedUrl }
      }),
    )

    return {
      uploadId,
      providerId: provider.providerId,
      partUrls: presignedPartUrls,
    }
  })

const MultipartCompleteSchema = z.object({
  objectKey: z.string(),
  uploadId: z.string(),
  providerId: z.string().nullable().optional(),
})

export const uploadMultipartComplete = createServerFn({ method: 'POST' })
  .inputValidator((d: z.infer<typeof MultipartCompleteSchema>) =>
    MultipartCompleteSchema.parse(d),
  )
  .handler(async ({ data }) => {
    await getAuthenticatedUser() // Ensure authenticated

    const { ListPartsCommand, CompleteMultipartUploadCommand } =
      await import('@aws-sdk/client-s3')
    const provider = await getProviderClientById(data.providerId ?? null)

    const listedParts = await provider.client.send(
      new ListPartsCommand({
        Bucket: provider.bucketName,
        Key: data.objectKey,
        UploadId: data.uploadId,
      }),
    )

    const parts = (listedParts.Parts ?? [])
      .filter((part): part is { ETag: string; PartNumber: number } => {
        return Boolean(part.ETag && part.PartNumber)
      })
      .sort((a, b) => a.PartNumber - b.PartNumber)

    if (parts.length === 0) {
      throw new Error('No uploaded parts were found for this upload session')
    }

    await provider.client.send(
      new CompleteMultipartUploadCommand({
        Bucket: provider.bucketName,
        Key: data.objectKey,
        UploadId: data.uploadId,
        MultipartUpload: {
          Parts: parts.map((part) => ({
            ETag: part.ETag,
            PartNumber: part.PartNumber,
          })),
        },
      }),
    )

    return { ok: true }
  })

const RegisterFileSchema = z.object({
  fileName: z.string(),
  objectKey: z.string(),
  mimeType: z.string().nullable().optional(),
  fileSize: z.number().nonnegative(),
  parentFolderId: z.string().nullable().optional(),
  providerId: z.string().nullable().optional(),
})

export const registerFile = createServerFn({ method: 'POST' })
  .inputValidator((d: z.infer<typeof RegisterFileSchema>) =>
    RegisterFileSchema.parse(d),
  )
  .handler(async ({ data }) => {
    const authUser = await getAuthenticatedUser()

    const [{ db }, { file: storageFile, folder, userStorage }] =
      await Promise.all([import('@/db'), import('@/db/schema/storage')])

    const { eq, sql } = await import('drizzle-orm')

    const storageRows = await db
      .select({ fileSizeLimit: userStorage.fileSizeLimit })
      .from(userStorage)
      .where(eq(userStorage.userId, authUser.id))
      .limit(1)
    const fileSizeLimit =
      storageRows[0]?.fileSizeLimit ?? DEFAULT_FILE_SIZE_LIMIT_BYTES

    if (data.fileSize > fileSizeLimit) {
      throw new Error(
        `File exceeds your maximum allowed size (${fileSizeLimit} bytes)`,
      )
    }

    let isPrivatelyLocked = false
    if (data.parentFolderId) {
      const { and, eq: eqForFolder } = await import('drizzle-orm')
      const parentRows = await db
        .select({ isPrivatelyLocked: folder.isPrivatelyLocked })
        .from(folder)
        .where(
          and(
            eqForFolder(folder.id, data.parentFolderId),
            eqForFolder(folder.userId, authUser.id),
          ),
        )
        .limit(1)
      if (parentRows.length > 0) {
        isPrivatelyLocked = parentRows[0].isPrivatelyLocked
      }
    }

    const resolvedProviderId = await resolveProviderId(data.providerId)

    const [insertedFile] = await db
      .insert(storageFile)
      .values({
        name: data.fileName,
        objectKey: data.objectKey,
        mimeType: data.mimeType || null,
        sizeInBytes: data.fileSize,
        userId: authUser.id,
        folderId: data.parentFolderId || null,
        providerId: resolvedProviderId,
        isPrivatelyLocked,
      })
      .returning({
        id: storageFile.id,
        name: storageFile.name,
        mimeType: storageFile.mimeType,
        sizeInBytes: storageFile.sizeInBytes,
        objectKey: storageFile.objectKey,
        createdAt: storageFile.createdAt,
      })

    // Upsert userStorage and increment usedStorage atomically
    try {
      await db
        .insert(userStorage)
        .values({
          userId: authUser.id,
          usedStorage: data.fileSize,
        })
        .onConflictDoUpdate({
          target: userStorage.userId,
          set: {
            usedStorage: sql`${userStorage.usedStorage} + ${data.fileSize}`,
          },
        })
    } catch (storageErr) {
      console.error('[Server] Failed to update usedStorage:', storageErr)
    }

    const { invalidateFolderCache, invalidateQuotaCache } =
      await import('@/lib/cache-invalidation')
    await invalidateFolderCache(authUser.id, data.parentFolderId || null)
    await invalidateQuotaCache(authUser.id)

    return { file: insertedFile }
  })
