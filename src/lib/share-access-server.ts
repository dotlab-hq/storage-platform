import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

type FileItem = {
  id: string
  name: string
  mimeType: string | null
  sizeInBytes: number
  objectKey: string
  providerId: string | null
}

type FolderItem = { id: string; name: string }

export type FolderTreePayload = {
  rootFolderId: string
  rootFolderName: string
  folders: {
    id: string
    name: string
    parentFolderId: string | null
    depth: number
  }[]
  files: {
    id: string
    name: string
    mimeType: string | null
    sizeInBytes: number
    folderId: string | null
  }[]
}


export type SharePagePayload =
  | {
    type: 'file'
    name: string
    mimeType: string | null
    sizeInBytes: number
    presignedUrl: string
  }
  | {
    type: 'folder'
    name: string
    folderId: string
    tree: FolderTreePayload | null
  }

// Helper function to normalize share token (NOT a server function)
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

// Helper function to get share data from DB (NOT a server function)
async function getShareDataFromDB(token: string) {
  const { db } = await import('@/db')
  const {
    shareLink,
    file: storageFile,
    folder,
  } = await import('@/db/schema/storage')
  const { eq, and } = await import('drizzle-orm')

  const normalizedToken = normalizeShareToken(token)
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
}

// Helper function to get presigned URL (NOT a server function)
async function generatePresignedUrl(
  objectKey: string,
  fileName: string,
  providerId: string,
  isDownload: boolean
) {
  const { getProviderClientById } = await import('@/lib/s3-provider-client')
  const { GetObjectCommand } = await import('@aws-sdk/client-s3')
  const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')

  try {
    const provider = await getProviderClientById(providerId)

    const command = new GetObjectCommand({
      Bucket: provider.bucketName,
      Key: objectKey,
      ResponseContentDisposition: isDownload
        ? `attachment; filename="${fileName}"`
        : `inline; filename="${fileName}"`,
    })

    const presignedUrl = await getSignedUrl(provider.client, command, {
      expiresIn: 3600,
    })
    return { presignedUrl }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(
      '[generatePresignedUrl] Failed to generate presigned URL:',
      {
        providerId,
        objectKey,
        error: message,
      },
    )
    throw new Error(
      `Failed to generate URL: ${message}. ` +
        `Check that the storage provider is properly configured and the region matches the bucket's region.`,
    )
  }
}

// Helper function to get folder tree (NOT a server function)
async function getFolderTreeData(token: string) {
  const share = await getShareDataFromDB(token)
  if (!share || share.type !== 'folder' || !share.link.folderId) return null

  const { db } = await import('@/db')
  const { sql } = await import('drizzle-orm')

  const ownerId = share.link.sharedByUserId
  const rootFolderId = share.link.folderId

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
}

// Main server function - the ONLY server function in this file
export const getSharePageDataFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ token: z.string() }))
  .handler(async ({ data }) => {
    const result = await getShareDataFromDB(data.token)
    if (!result) {
      throw new Error('Share link not found, expired, or inactive')
    }

    console.log('Share result:', result)

    if (result.type === 'file') {
      const fileItem = result.item as FileItem
      const { presignedUrl } = await generatePresignedUrl(
        fileItem.objectKey,
        fileItem.name,
        fileItem.providerId!,
        false
      )
      return {
        type: 'file',
        name: fileItem.name,
        mimeType: fileItem.mimeType,
        sizeInBytes: fileItem.sizeInBytes,
        presignedUrl,
      } as SharePagePayload
    }

    const folderItem = result.item as FolderItem
    const tree = await getFolderTreeData(data.token)
    return {
      type: 'folder',
      name: folderItem.name,
      folderId: folderItem.id,
      tree,
    } as SharePagePayload
  })

export const getShareDownloadUrlFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ token: z.string() }))
  .handler(async ({ data }) => {
    const result = await getShareDataFromDB(data.token)
    if (!result) {
      throw new Error('Share link not found, expired, or inactive')
    }
    if (result.type !== 'file') {
      throw new Error('Share link is not a file')
    }
    const fileItem = result.item as FileItem
    const { presignedUrl: url } = await generatePresignedUrl(
      fileItem.objectKey,
      fileItem.name,
      fileItem.providerId!,
      true
    )
    return { url, name: fileItem.name }
  })
