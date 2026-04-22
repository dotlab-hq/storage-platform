import { eq, sql } from 'drizzle-orm'
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

async function findShareLinkByToken(token: string) {
  const [{ db }, { shareLink }] = await Promise.all([
    import('@/db'),
    import('@/db/schema/storage'),
  ])

  const normalizedToken = normalizeShareToken(token)
  if (!normalizedToken) return null

  const candidates = [normalizedToken, normalizedToken.toLowerCase()]

  for (const candidate of candidates) {
    const rows = await db
      .select()
      .from(shareLink)
      .where(eq(shareLink.shareToken, candidate))
      .limit(1)
    if (rows.length > 0) {
      return rows[0]
    }
  }

  // Legacy fallback in case old links were shared using the row id.
  const byIdRows = await db
    .select()
    .from(shareLink)
    .where(eq(shareLink.id, normalizedToken))
    .limit(1)

  return byIdRows.length > 0 ? byIdRows[0] : null
}

async function buildPresignedUrl(
  objectKey: string,
  fileName: string,
  providerId: string | null,
  disposition: 'inline' | 'attachment',
) {
  const { GetObjectCommand } = await import('@aws-sdk/client-s3')
  const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')
  const provider = await getProviderClientById(providerId)

  const command = new GetObjectCommand({
    Bucket: provider.bucketName,
    Key: objectKey,
    ResponseContentDisposition: `${disposition}; filename="${fileName}"`,
  })

  return getSignedUrl(provider.client, command, { expiresIn: 3600 })
}

export async function getShareByToken(token: string) {
  const [{ db }, { file: storageFile, folder }] = await Promise.all([
    import('@/db'),
    import('@/db/schema/storage'),
  ])

  const link = await findShareLinkByToken(token)
  if (!link) return null
  if (!link.isActive) return null

  if (link.expiresAt && link.expiresAt < new Date()) return null

  if (link.fileId) {
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
      .where(eq(storageFile.id, link.fileId))
      .limit(1)
    if (fileRows.length === 0) return null
    const fileRow = fileRows[0]
    if (fileRow.isPrivatelyLocked && !link.consentedPrivatelyUnlock) {
      throw new Error('File is privately locked')
    }
    return { type: 'file' as const, link, item: fileRow }
  }

  if (link.folderId) {
    const folderRows = await db
      .select({
        id: folder.id,
        name: folder.name,
      })
      .from(folder)
      .where(eq(folder.id, link.folderId))
      .limit(1)
    if (folderRows.length === 0) return null
    const folderRow = folderRows[0]
    return { type: 'folder' as const, link, item: folderRow }
  }

  return null
}

export async function getSharedFilePresignedUrl(
  objectKey: string,
  fileName: string,
  providerId: string | null,
) {
  return buildPresignedUrl(objectKey, fileName, providerId, 'inline')
}

export async function getSharedFileDownloadUrl(
  objectKey: string,
  fileName: string,
  providerId: string | null,
) {
  return buildPresignedUrl(objectKey, fileName, providerId, 'attachment')
}

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

export async function getSharedFolderTreeByToken(token: string) {
  const share = await getShareByToken(token)
  if (!share || share.type !== 'folder' || !share.link.folderId) return null

  const [{ db }] = await Promise.all([import('@/db')])
  const ownerId = share.link.sharedByUserId
  const rootFolderId = share.link.folderId

  const folderRows = await db.all<SharedFolderNode>(sql`
        WITH RECURSIVE folder_tree AS (
                        SELECT f.id, f.name, f.parent_folder_id AS "parentFolderId", CAST(0 AS INTEGER) AS depth
                        FROM "folder" f
            WHERE f.id = ${rootFolderId}
              AND f.user_id = ${ownerId}
              AND f.is_deleted = false
            UNION ALL
            SELECT child.id, child.name, child.parent_folder_id AS "parentFolderId", folder_tree.depth + 1 AS depth
                        FROM "folder" child
            INNER JOIN folder_tree ON child.parent_folder_id = folder_tree.id
            WHERE child.user_id = ${ownerId}
              AND child.is_deleted = false
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
            UNION ALL
            SELECT child.id
                        FROM "folder" child
            INNER JOIN folder_tree ON child.parent_folder_id = folder_tree.id
            WHERE child.user_id = ${ownerId}
              AND child.is_deleted = false
        )
        SELECT fl.id, fl.name, fl.mime_type AS "mimeType", fl.size_in_bytes AS "sizeInBytes", fl.folder_id AS "folderId",
               fl.is_privately_locked AS "isPrivatelyLocked"
                FROM "file" fl
        INNER JOIN folder_tree ON fl.folder_id = folder_tree.id
        WHERE fl.user_id = ${ownerId}
          AND fl.is_deleted = false
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
