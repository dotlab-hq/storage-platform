import { db } from '@/db'
import { folder } from '@/db/schema/storage'
import { and, eq, isNull } from 'drizzle-orm'

export async function resolveVirtualFolder(
  userId: string,
  rootFolderId: string | null,
  path: string,
): Promise<string | null> {
  const segments = path.split('/').filter(Boolean)
  if (segments.length === 0) {
    return rootFolderId
  }

  let currentFolderId = rootFolderId

  for (const segment of segments) {
    let condition = and(
      eq(folder.userId, userId),
      eq(folder.name, segment),
      currentFolderId
        ? eq(folder.parentFolderId, currentFolderId)
        : isNull(folder.parentFolderId),
      eq(folder.isDeleted, false),
    )

    let rows = await db
      .select({ id: folder.id })
      .from(folder)
      .where(condition)
      .limit(1)

    if (rows.length === 0) {
      const inserted = await db
        .insert(folder)
        .values({
          userId,
          name: segment,
          parentFolderId: currentFolderId,
          isDeleted: false,
        })
        .returning({ id: folder.id })
      currentFolderId = inserted[0].id
    } else {
      currentFolderId = rows[0].id
    }
  }

  return currentFolderId
}

export function splitObjectKey(objectKey: string): {
  folderPath: string
  fileName: string
  isDirectory: boolean
} {
  const isDirectory = objectKey.endsWith('/')
  const normalizedKey = objectKey.replace(/\/+$/, '')
  const lastSlash = normalizedKey.lastIndexOf('/')

  let folderPath = ''
  let fileName = ''

  if (lastSlash === -1) {
    folderPath = ''
    fileName = normalizedKey
  } else {
    folderPath = normalizedKey.substring(0, lastSlash)
    fileName = normalizedKey.substring(lastSlash + 1)
  }

  if (isDirectory) {
    folderPath = folderPath ? `${folderPath}/${fileName}` : fileName
    fileName = ''
  }

  return { folderPath, fileName, isDirectory }
}
