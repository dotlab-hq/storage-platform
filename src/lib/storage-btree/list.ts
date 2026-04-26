import { and, eq, like } from 'drizzle-orm'
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

function stripBasePath( fullPath: string, basePath: string ): string {
  const base = normalizePath( basePath )
  if ( !base ) return fullPath
  const prefix = `${base}/`
  if ( fullPath === base ) return ''
  if ( fullPath.startsWith( prefix ) ) {
    return fullPath.slice( prefix.length )
  }
  return fullPath
}

export async function listObjectsByBtree( input: {
  userId: string
  mappedFolderId: string | null
  prefix: string
} ): Promise<BtreeListedObject[]> {
  try {
    if ( input.mappedFolderId ) {
      const base = await resolveFolderPath( input.userId, input.mappedFolderId )
      if ( !base ) {
        await seedNodeById( input.userId, 'folder', input.mappedFolderId )
      }
    }

    const basePath = input.mappedFolderId
      ? await resolveFolderPath( input.userId, input.mappedFolderId )
      : ''
    if ( input.mappedFolderId && basePath.length === 0 ) {
      return []
    }
    const requestedPrefix = normalizePath( input.prefix )
    const fullPrefix = joinPath( basePath, requestedPrefix )
    const likePattern =
      fullPrefix.length === 0
        ? '%'
        : requestedPrefix.length === 0 && basePath.length > 0
          ? `${basePath}/%`
          : `${fullPrefix}%`

    const rows = await db
      .select( {
        fullPath: storageNodeBtree.fullPath,
        sizeInBytes: storageNodeBtree.sizeInBytes,
        etag: storageNodeBtree.etag,
        lastModified: storageNodeBtree.lastModified,
      } )
      .from( storageNodeBtree )
      .where(
        and(
          eq( storageNodeBtree.userId, input.userId ),
          eq( storageNodeBtree.nodeType, 'file' ),
          eq( storageNodeBtree.isDeleted, false ),
          like( storageNodeBtree.fullPath, likePattern ),
        ),
      )

    return rows
      .map( ( row ) => {
        const relativeKey = stripBasePath( row.fullPath, basePath )
        return {
          key: relativeKey,
          size: row.sizeInBytes ?? 0,
          eTag: row.etag ?? null,
          lastModified: row.lastModified ?? new Date( 0 ),
        }
      } )
      .filter( ( row ) => row.key.startsWith( requestedPrefix ) )
  } catch ( error ) {
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
