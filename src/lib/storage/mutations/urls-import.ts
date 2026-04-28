import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/server-auth.server'
import { selectProviderForUpload } from '@/lib/s3-provider-client'
import { DEFAULT_FILE_SIZE_LIMIT_BYTES } from '@/lib/storage-quota-constants'
import { logActivity } from '@/lib/activity'
import { registerFile } from '@/lib/upload-server'

const ImportFromUrlSchema = z.object({
  url: z.string().url(),
  fileName: z.string().min(1).optional(),
  parentFolderId: z.string().nullable().optional(),
})

export const MAX_IMPORT_FROM_URL_SIZE = 5 * 1024 * 1024 * 1024 // 5GB limit for URL imports

export const importFileFromUrl = createServerFn({ method: 'POST' })
  .inputValidator(ImportFromUrlSchema)
  .handler(async ({ data }) => {
    const user = await getAuthenticatedUser()
    const userId = user.id

    const fileSizeLimit = await getUserFileSizeLimit(userId)

    const response = await fetch(data.url, {
      method: 'HEAD',
      headers: { 'User-Agent': 'DOT-Storage-Platform/1.0' },
    })

    if (!response.ok) {
      throw new Error(
        `Failed to access URL: ${response.status} ${response.statusText}`,
      )
    }

    const contentLength = response.headers.get('content-length')
    if (!contentLength) {
      throw new Error('Unable to determine file size from URL')
    }

    const fileSize = parseInt(contentLength, 10)

    if (fileSize > fileSizeLimit) {
      throw new Error(
        `File exceeds your maximum allowed size (${formatFileSize(fileSizeLimit)})`,
      )
    }

    if (fileSize > MAX_IMPORT_FROM_URL_SIZE) {
      throw new Error(
        `File exceeds maximum import size of ${formatFileSize(MAX_IMPORT_FROM_URL_SIZE)}`,
      )
    }

    const contentType =
      response.headers.get('content-type') || 'application/octet-stream'

    let fileName = data.fileName
    if (!fileName) {
      const url = new URL(data.url)
      fileName = url.pathname.split('/').pop() || 'download'
      try {
        fileName = decodeURIComponent(fileName)
      } catch {}
      fileName = fileName.split('?')[0]
    }

    const dotIndex = fileName.lastIndexOf('.')
    const base =
      (dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName)
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9._-]/g, '') || 'file'
    const ext =
      dotIndex > 0
        ? `.${fileName.slice(dotIndex + 1).replace(/[^a-zA-Z0-9]/g, '')}`
        : ''
    const objectKey = `${userId}/${crypto.randomUUID()}-${base}${ext}`

    const provider = await selectProviderForUpload(fileSize, userId)
    const { PutObjectCommand } = await import('@aws-sdk/client-s3')
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')
    const command = new PutObjectCommand({
      Bucket: provider.bucketName,
      Key: objectKey,
      ContentType: contentType,
    })

    const presignedUrl = await getSignedUrl(provider.client, command, {
      expiresIn: 3600,
    })

    const sourceResponse = await fetch(data.url)
    if (!sourceResponse.ok) {
      throw new Error(
        `Failed to download file: ${sourceResponse.status} ${sourceResponse.statusText}`,
      )
    }

    const downloadedSize = sourceResponse.headers.get('content-length')
    if (downloadedSize && parseInt(downloadedSize, 10) !== fileSize) {
      throw new Error('File size mismatch during download')
    }

    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: sourceResponse.body,
      duplex: 'half',
    })

    if (!uploadResponse.ok) {
      throw new Error(
        `Failed to upload to storage: ${uploadResponse.status} ${uploadResponse.statusText}`,
      )
    }

    const { file } = await registerFile({
      data: {
        fileName,
        objectKey,
        mimeType: contentType,
        fileSize,
        parentFolderId: data.parentFolderId,
        providerId: provider.providerId,
      },
    })

    await logActivity({
      userId,
      eventType: 'file_import_from_url',
      resourceType: 'file',
      resourceId: file.id,
      tags: ['Files', 'Import', 'URL'],
      meta: {
        name: fileName,
        size: fileSize,
        mimeType: contentType,
        sourceUrl: data.url,
        parentFolderId: data.parentFolderId,
        providerId: provider.providerId,
      },
    })

    return { file }
  })

async function getUserFileSizeLimit(userId: string): Promise<number> {
  const [{ db }, { userStorage }, { eq }] = await Promise.all([
    import('@/db'),
    import('@/db/schema/storage'),
    import('drizzle-orm'),
  ])

  const storageRows = await db
    .select({ fileSizeLimit: userStorage.fileSizeLimit })
    .from(userStorage)
    .where(eq(userStorage.userId, userId))
    .limit(1)

  return storageRows[0]?.fileSizeLimit ?? DEFAULT_FILE_SIZE_LIMIT_BYTES
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}
