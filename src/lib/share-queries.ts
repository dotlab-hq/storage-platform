import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, and, sql } from 'drizzle-orm'
import { getProviderClientById } from '@/lib/s3-provider-client'

function normalizeShareToken(token: string): string {
  const trimmed = token.trim()
  if (!trimmed) return ''

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed)
      const segments = parsed.pathname.split('/').filter(Boolean)
      return decodeURIComponent(segments[segments.length - 1] ?? '').trim()
    } catch {
      return ''
    }
  }

  try {
    return decodeURIComponent(trimmed)
  } catch {
    return trimmed
  }
}

const GetShareByTokenSchema = z.object({
  token: z.string().min(1),
})

export const getShareByToken = createServerFn({ method: 'POST' })
  .inputValidator(GetShareByTokenSchema)
  .handler(async ({ data }) => {
    const { db } = await import('@/db')
    const {
      shareLink,
      file: storageFile,
      folder,
    } = await import('@/db/schema/storage')

    const normalizedToken = normalizeShareToken(data.token)
    if (!normalizedToken) return null

    const candidates = [normalizedToken, normalizedToken.toLowerCase()]

    let linkRow = null
    for (const candidate of candidates) {
      const rows = await db
        .select()
        .from(shareLink)
        .where(eq(shareLink.shareToken, candidate))
        .limit(1)
      if (rows.length > 0) {
        linkRow = rows[0]
        break
      }
    }

    if (!linkRow) {
      const byIdRows = await db
        .select()
        .from(shareLink)
        .where(eq(shareLink.id, normalizedToken))
        .limit(1)
      linkRow = byIdRows[0] ?? null
    }

    if (!linkRow) return null
    if (!linkRow.isActive) return null

    if (linkRow.expiresAt && linkRow.expiresAt < new Date()) return null

    if (linkRow.fileId) {
      const fileRows = await db
        .select({
          id: storageFile.id,
          name: storageFile.name,
          mimeType: storageFile.mimeType,
          sizeInBytes: storageFile.sizeInBytes,
          objectKey: storageFile.objectKey,
          providerId: storageFile.providerId,
          isPrivatelyLocked: storageFile.isPrivatelyLocked,
        })
        .from(storageFile)
        .where(
          and(
            eq(storageFile.id, linkRow.fileId),
            eq(storageFile.isTrashed, false),
          ),
        )
        .limit(1)
      if (fileRows.length === 0) return null
      const fileRow = fileRows[0]
      if (fileRow.isPrivatelyLocked && !linkRow.consentedPrivatelyUnlock) {
        throw new Error('File is privately locked')
      }
      return { type: 'file' as const, link: linkRow, item: fileRow }
    }

    if (linkRow.folderId) {
      const folderRows = await db
        .select({
          id: folder.id,
          name: folder.name,
        })
        .from(folder)
        .where(
          and(eq(folder.id, linkRow.folderId), eq(folder.isTrashed, false)),
        )
        .limit(1)
      if (folderRows.length === 0) return null
      const folderRow = folderRows[0]
      return { type: 'folder' as const, link: linkRow, item: folderRow }
    }

    return null
  })

const GetSharedFilePresignedUrlSchema = z.object({
  objectKey: z.string().min(1),
  fileName: z.string().min(1),
  providerId: z.string().nullable(),
})

export const getSharedFilePresignedUrl = createServerFn({ method: 'POST' })
  .inputValidator(GetSharedFilePresignedUrlSchema)
  .handler(async ({ data }) => {
    const { GetObjectCommand } = await import('@aws-sdk/client-s3')
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')
    const provider = await getProviderClientById(data.providerId)

    const command = new GetObjectCommand({
      Bucket: provider.bucketName,
      Key: data.objectKey,
      ResponseContentDisposition: `inline; filename="${data.fileName}"`,
    })

    return getSignedUrl(provider.client, command, { expiresIn: 3600 })
  })

export const getSharedFileDownloadUrl = createServerFn({ method: 'POST' })
  .inputValidator(GetSharedFilePresignedUrlSchema)
  .handler(async ({ data }) => {
    const { GetObjectCommand } = await import('@aws-sdk/client-s3')
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')
    const provider = await getProviderClientById(data.providerId)

    const command = new GetObjectCommand({
      Bucket: provider.bucketName,
      Key: data.objectKey,
      ResponseContentDisposition: `attachment; filename="${data.fileName}"`,
    })

    return getSignedUrl(provider.client, command, { expiresIn: 3600 })
  })

const GetSharedFolderTreeSchema = z.object({
  token: z.string().min(1),
})

type SharedFolderNode = {
  id: string
  name: string
  parentFolderId: string | null
  depth: number
}

type SharedFolderFile = {
  id: string
  name: string
  mimeType: string | null
  sizeInBytes: number
  folderId: string | null
  isPrivatelyLocked: boolean
}

export const getSharedFolderTreeByToken = createServerFn({ method: 'POST' })
  .inputValidator(GetSharedFolderTreeSchema)
  .handler(async ({ data }) => {
    const { db } = await import('@/db')

    const share = await getShareByToken({ data: { token: data.token } })
    if (!share || share.type !== 'folder' || !share.link.folderId) return null

    const ownerId = share.link.sharedByUserId
    const rootFolderId = share.link.folderId

    const folderRows = await db.all<SharedFolderNode>(sql`
        WITH RECURSIVE folder_tree AS (
                        SELECT f.id, f.name, f.parent_folder_id AS "parentFolderId", CAST(0 AS INTEGER) AS depth
                        FROM "folder" f
            WHERE f.id = ${rootFolderId}
              AND f.user_id = ${ownerId}
              AND f.is_deleted = false
              AND f.is_trashed = false
            UNION ALL
            SELECT child.id, child.name, child.parent_folder_id AS "parentFolderId", folder_tree.depth + 1 AS depth
                        FROM "folder" child
            INNER JOIN folder_tree ON child.parent_folder_id = folder_tree.id
            WHERE child.user_id = ${ownerId}
              AND child.is_deleted = false
              AND child.is_trashed = false
        )
        SELECT id, name, "parentFolderId", depth
        FROM folder_tree
        ORDER BY depth ASC, name ASC
    `)

    const fileRows = await db.all<SharedFolderFile>(sql`
        WITH RECURSIVE folder_tree AS (
            SELECT f.id
                        FROM "folder" f
            WHERE f.id = ${rootFolderId}
              AND f.user_id = ${ownerId}
              AND f.is_deleted = false
              AND f.is_trashed = false
            UNION ALL
            SELECT child.id
                        FROM "folder" child
            INNER JOIN folder_tree ON child.parent_folder_id = folder_tree.id
            WHERE child.user_id = ${ownerId}
              AND child.is_deleted = false
              AND child.is_trashed = false
        )
        SELECT fl.id, fl.name, fl.mime_type AS "mimeType", fl.size_in_bytes AS "sizeInBytes", fl.folder_id AS "folderId",
               fl.is_privately_locked AS "isPrivatelyLocked"
                FROM "file" fl
        INNER JOIN folder_tree ON fl.folder_id = folder_tree.id
        WHERE fl.user_id = ${ownerId}
          AND fl.is_deleted = false
          AND fl.is_trashed = false
          AND (fl.is_privately_locked = false OR ${share.link.consentedPrivatelyUnlock} = true)
        ORDER BY fl.name ASC
    `)

    const root = folderRows.find((row) => row.depth === 0) ?? null
    if (!root) {
      throw new Error('Shared folder root is missing')
    }

    return {
      rootFolderId,
      rootFolderName: root.name,
      folders: folderRows,
      files: fileRows,
    }
  })
