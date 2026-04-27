import { and, eq, inArray, like } from 'drizzle-orm'
import { db } from '@/db'
import { storageNodeBtree } from '@/db/schema/storage-btree'
import { joinPath, normalizePath } from '@/lib/storage-btree/path'
import { resolveFolderPath } from '@/lib/storage-btree/index'
import { seedNodeById } from '@/lib/storage-btree/seed'

export type BtreeListedObject = {
  key: string
  size: number
  eTag: string | null
  lastModified: Date
}

function stripBasePath(fullPath: string, basePath: string): string {
  const base = normalizePath(basePath)
  if (!base) return fullPath
  const prefix = `${base}/`
  if (fullPath === base) return ''
  if (fullPath.startsWith(prefix)) {
    return fullPath.slice(prefix.length)
  }
  return fullPath
}

export async function listObjectsByBtree(input: {
  userId: string
  mappedFolderId: string | null
  prefix: string
}): Promise<BtreeListedObject[]> {
  try {
    if (input.mappedFolderId) {
      const base = await resolveFolderPath(input.userId, input.mappedFolderId)
      if (!base) {
        await seedNodeById(input.userId, 'folder', input.mappedFolderId)
      }
    }

    const basePath = input.mappedFolderId
      ? await resolveFolderPath(input.userId, input.mappedFolderId)
      : ''
    if (input.mappedFolderId && basePath.length === 0) {
      return []
    }
    const requestedPrefix = normalizePath(input.prefix)
    const fullPrefix = joinPath(basePath, requestedPrefix)
    const likePattern =
      fullPrefix.length === 0
        ? '%'
        : requestedPrefix.length === 0 && basePath.length > 0
          ? `${basePath}/%`
          : `${fullPrefix}%`

    const rows = await db
      .select({
        nodeType: storageNodeBtree.nodeType,
        fullPath: storageNodeBtree.fullPath,
        sizeInBytes: storageNodeBtree.sizeInBytes,
        etag: storageNodeBtree.etag,
        lastModified: storageNodeBtree.lastModified,
      })
      .from(storageNodeBtree)
      .where(
        and(
          eq(storageNodeBtree.userId, input.userId),
          inArray(storageNodeBtree.nodeType, ['file', 'folder']),
          eq(storageNodeBtree.isDeleted, false),
          like(storageNodeBtree.fullPath, likePattern),
        ),
      )

    return rows
      .filter(
        (row): row is typeof row & { fullPath: string } =>
          typeof row.fullPath === 'string' && row.fullPath.length > 0,
      )
      .map((row) => {
        const relativePath = stripBasePath(row.fullPath, basePath)
        const key =
          row.nodeType === 'folder' ? `${relativePath}/` : relativePath
        return {
          key,
          size:
            row.nodeType === 'folder'
              ? 0
              : typeof row.sizeInBytes === 'number' &&
                  Number.isFinite(row.sizeInBytes)
                ? row.sizeInBytes
                : 0,
          eTag: row.nodeType === 'folder' ? null : (row.etag ?? null),
          lastModified: row.lastModified ?? new Date(0),
        }
      })
      .filter((row) => {
        if (row.key.length === 0) {
          return false
        }
        return row.key.startsWith(requestedPrefix)
      })
  } catch (error) {
    const message =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : 'Unknown btree list error'
    console.warn(
      '[S3 Gateway] listObjectsByBtree fallback to legacy traversal due to schema mismatch:',
      message,
    )
    return []
  }
}
