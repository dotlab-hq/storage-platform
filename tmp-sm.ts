import { eq, and, inArray, sql } from 'drizzle-orm'
import { getProviderClientById } from '@/lib/s3-provider-client'
import { isDescendantFolder } from '@/lib/folder-paths'
import {
  buildStorageObjectKey,
  getMimeTypeFromFileName,
  isTextBasedFile,
} from '@/lib/file-type-utils'

export async function touchFolderOpened(userId: string, folderId: string) {
  const [{ db }, { folder }] = await Promise.all([
    import('@/db'),
    import('@/db/schema/storage'),
  ])
  await db
    .update(folder)
    .set({ lastOpenedAt: new Date() })
    .where(and(eq(folder.id, folderId), eq(folder.userId, userId)))
}

export async function renameItem(
  userId: string,
  itemId: string,
  newName: string,
  itemType: 'file' | 'folder',
) {
  const [{ db }, { file: storageFile, folder }] = await Promise.all([
    import('@/db'),
    import('@/db/schema/storage'),
  ])

  if (itemType === 'folder') {
    const [updated] = await db
      .update(folder)
      .set({ name: newName })
      .where(and(eq(folder.id, itemId), eq(folder.userId, userId)))
      .returning({ id: folder.id, name: folder.name })
    return updated
  }

  const [updated] = await db
    .update(storageFile)
    .set({ name: newName })
    .where(and(eq(storageFile.id, itemId), eq(storageFile.userId, userId)))
    .returning({ id: storageFile.id, name: storageFile.name })
  return updated
}

export async function deleteItems(
  userId: string,
  itemIds: string[],
  itemTypes: ('file' | 'folder')[],
) {
  const [{ db }, { file: storageFile, folder }] = await Promise.all([
    import('@/db'),
    import('@/db/schema/storage'),
  ])

  const now = new Date()
  const fileIds: string[] = []
  const folderIds: string[] = []
  for (let i = 0; i < itemIds.length; i++) {
    if (itemTypes[i] === 'file') fileIds.push(itemIds[i])
    else folderIds.push(itemIds[i])
  }

  // Soft-delete files
  if (fileIds.length > 0) {
    await db
      .update(storageFile)
      .set({ isDeleted: true, deletedAt: now })
      .where(
        and(inArray(storageFile.id, fileIds), eq(storageFile.userId, userId)),
      )
  }

  if (folderIds.length > 0) {
    // BFS: recursively collect all descendant folder IDs.
    // Each iteration queries one level of depth; for typical folder depths (< 10)
    // this is acceptable. A recursive CTE would be more efficient for deeply nested trees.
    const allFolderIds: string[] = [...folderIds]
    const visitedFolderIds = new Set<string>(folderIds)
    let toProcess: string[] = [...folderIds]
    let depth = 0

    while (toProcess.length > 0) {
      const children = await db
        .select({ id: folder.id })
        .from(folder)
        .where(
          and(
            eq(folder.userId, userId),
            inArray(folder.parentFolderId, toProcess),
          ),
        )
      const childIds = children
        .map((c) => c.id)
        .filter((childId) => {
          if (visitedFolderIds.has(childId)) {
            return false
          }

          visitedFolderIds.add(childId)
          return true
        })

      if (childIds.length === 0) {
        break
      }

      allFolderIds.push(...childIds)
      toProcess = childIds
      depth += 1

      if (depth > 1024) {
        throw new Error('Folder deletion traversal exceeded safe depth')
      }
    }

    // Soft-delete all folders (including descendants)
    await db
      .update(folder)
      .set({ isDeleted: true, deletedAt: now })
      .where(and(inArray(folder.id, allFolderIds), eq(folder.userId, userId)))

    // Soft-delete all files inside those folders
    await db
      .update(storageFile)
      .set({ isDeleted: true, deletedAt: now })
      .where(
        and(
          inArray(storageFile.folderId, allFolderIds),
          eq(storageFile.userId, userId),
        ),
      )
  }

  return { deletedFiles: fileIds.length, deletedFolders: folderIds.length }
}

export async function moveItems(
  userId: string,
  itemIds: string[],
  itemTypes: ('file' | 'folder')[],
  targetFolderId: string | null,
) {
  const [{ db }, { file: storageFile, folder }] = await Promise.all([
    import('@/db'),
    import('@/db/schema/storage'),
  ])

  const movingFolderIds = itemIds.filter(
    (_, index) => itemTypes[index] === 'folder',
  )
  let targetIsPrivatelyLocked = false
  let allUserFolders: { id: string; parentFolderId: string | null }[] = []

  if (targetFolderId) {
    const targetFolderRows = await db
      .select({
        id: folder.id,
        isPrivatelyLocked: folder.isPrivatelyLocked,
      })
      .from(folder)
      .where(and(eq(folder.id, targetFolderId), eq(folder.userId, userId)))
      .limit(1)

    if (targetFolderRows.length === 0) {
      throw new Error('Target folder not found')
    }

    targetIsPrivatelyLocked = targetFolderRows[0].isPrivatelyLocked

    if (movingFolderIds.length > 0) {
      allUserFolders = await db
        .select({
          id: folder.id,
          parentFolderId: folder.parentFolderId,
        })
        .from(folder)
        .where(eq(folder.userId, userId))

      for (const movingFolderId of movingFolderIds) {
        if (
          isDescendantFolder(movingFolderId, targetFolderId, allUserFolders)
        ) {
          throw new Error('Cannot move a folder into itself or its descendant')
        }
      }
    }
  }

  for (let i = 0; i < itemIds.length; i++) {
    const id = itemIds[i]
    const type = itemTypes[i]
    if (type === 'folder') {
      await db
        .update(folder)
        .set({ parentFolderId: targetFolderId })
        .where(and(eq(folder.id, id), eq(folder.userId, userId)))
    } else {
      await db
        .update(storageFile)
        .set({
          folderId: targetFolderId,
          isPrivatelyLocked: targetIsPrivatelyLocked,
        })
        .where(and(eq(storageFile.id, id), eq(storageFile.userId, userId)))
    }
  }
  return { moved: itemIds.length }
}

export async function getFilePresignedUrl(userId: string, fileId: string) {
  const [{ db }, { file: storageFile }] = await Promise.all([
    import('@/db'),
    import('@/db/schema/storage'),
  ])

  const fileRows = await db
    .select({
      objectKey: storageFile.objectKey,
      mimeType: storageFile.mimeType,
      name: storageFile.name,
      providerId: storageFile.providerId,
    })
    .from(storageFile)
    .where(and(eq(storageFile.id, fileId), eq(storageFile.userId, userId)))
    .limit(1)
  if (fileRows.length === 0) {
    throw new Error('File not found')
  }
  const row = fileRows[0]

  // Update lastOpenedAt
  await db
    .update(storageFile)
    .set({ lastOpenedAt: new Date() })
    .where(eq(storageFile.id, fileId))

  const { GetObjectCommand } = await import('@aws-sdk/client-s3')
  const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')
  const provider = await getProviderClientById(row.providerId ?? null)

  const command = new GetObjectCommand({
    Bucket: provider.bucketName,
    Key: row.objectKey,
    ResponseContentDisposition: `inline; filename="${row.name}"`,
  })

  const url = await getSignedUrl(provider.client, command, { expiresIn: 3600 })
  return { url, name: row.name, mimeType: row.mimeType }
}

export async function getOwnedFileRedirectUrl(
  userId: string,
  fileId: string,
  folderId: string | null,
) {
  const [{ db }, { file: storageFile, folder }] = await Promise.all([
    import('@/db'),
    import('@/db/schema/storage'),
  ])

  if (folderId) {
    const ownedFolders = await db
      .select({ id: folder.id })
      .from(folder)
      .where(and(eq(folder.id, folderId), eq(folder.userId, userId)))
      .limit(1)

    if (ownedFolders.length === 0) {
      throw new Error('Folder not found')
    }
  }

  const ownedFiles = await db
    .select({
      id: storageFile.id,
      folderId: storageFile.folderId,
    })
    .from(storageFile)
    .where(and(eq(storageFile.id, fileId), eq(storageFile.userId, userId)))
    .limit(1)

  if (ownedFiles.length === 0) {
    throw new Error('File not found')
  }

  if (folderId && ownedFiles[0].folderId !== folderId) {
    throw new Error('File does not belong to the requested folder')
  }

  const { url } = await getFilePresignedUrl(userId, fileId)
  return url
}

type SaveTextFileInput = {
  fileId: string | null
  fileName: string
  content: string
  parentFolderId: string | null
}

async function getInheritedPrivateLock(
  userId: string,
  folderId: string | null,
) {
  if (!folderId) return false

  const [{ db }, { folder }] = await Promise.all([
    import('@/db'),
    import('@/db/schema/storage'),
  ])

  const parentRows = await db
    .select({ isPrivatelyLocked: folder.isPrivatelyLocked })
    .from(folder)
    .where(and(eq(folder.id, folderId), eq(folder.userId, userId)))
    .limit(1)

  return parentRows[0]?.isPrivatelyLocked ?? false
}

export async function getTextFileContent(userId: string, fileId: string) {
  const [{ db }, { file: storageFile }] = await Promise.all([
    import('@/db'),
    import('@/db/schema/storage'),
  ])

  const rows = await db
    .select({
      id: storageFile.id,
      name: storageFile.name,
      objectKey: storageFile.objectKey,
      mimeType: storageFile.mimeType,
      providerId: storageFile.providerId,
    })
    .from(storageFile)
    .where(
      and(
        eq(storageFile.id, fileId),
        eq(storageFile.userId, userId),
        eq(storageFile.isDeleted, false),
      ),
    )
    .limit(1)

  if (rows.length === 0) {
    throw new Error('File not found')
  }

  const row = rows[0]
  if (!isTextBasedFile(row.name, row.mimeType)) {
    throw new Error('Only text-based files can be opened in the editor')
  }

  const { GetObjectCommand } = await import('@aws-sdk/client-s3')
  const provider = await getProviderClientById(row.providerId ?? null)
  const response = await provider.client.send(
    new GetObjectCommand({
      Bucket: provider.bucketName,
      Key: row.objectKey,
    }),
  )

  const content = response.Body ? await response.Body.transformToString() : ''

  await db
    .update(storageFile)
    .set({ lastOpenedAt: new Date() })
    .where(eq(storageFile.id, fileId))

  return {
    id: row.id,
    name: row.name,
    mimeType: row.mimeType,
    content,
  }
}

export async function saveTextFile(userId: string, input: SaveTextFileInput) {
  const [{ db }, { file: storageFile, userStorage }] = await Promise.all([
    import('@/db'),
    import('@/db/schema/storage'),
  ])
  const { PutObjectCommand } = await import('@aws-sdk/client-s3')

  const trimmedFileName = input.fileName.trim()
  if (!trimmedFileName) {
    throw new Error('File name is required')
  }

  const mimeType = getMimeTypeFromFileName(trimmedFileName) ?? 'text/html'
  if (!isTextBasedFile(trimmedFileName, mimeType)) {
    throw new Error('Only text-based files can be saved in the editor')
  }

  const fileBytes = new TextEncoder().encode(input.content)
  const fileSize = fileBytes.byteLength

  if (input.fileId) {
    const rows = await db
      .select({
        id: storageFile.id,
        objectKey: storageFile.objectKey,
        providerId: storageFile.providerId,
        sizeInBytes: storageFile.sizeInBytes,
      })
      .from(storageFile)
      .where(
        and(
          eq(storageFile.id, input.fileId),
          eq(storageFile.userId, userId),
          eq(storageFile.isDeleted, false),
        ),
      )
      .limit(1)

    if (rows.length === 0) {
      throw new Error('File not found')
    }

    const existing = rows[0]
    const provider = await getProviderClientById(existing.providerId ?? null)

    await provider.client.send(
      new PutObjectCommand({
        Bucket: provider.bucketName,
        Key: existing.objectKey,
        Body: fileBytes,
        ContentType: mimeType,
      }),
    )

    await db
      .update(storageFile)
      .set({
        name: trimmedFileName,
        mimeType,
        sizeInBytes: fileSize,
        lastModified: new Date(),
      })
      .where(eq(storageFile.id, existing.id))

    const sizeDelta = fileSize - existing.sizeInBytes
    if (sizeDelta !== 0) {
      await db
        .insert(userStorage)
        .values({
          userId,
          usedStorage: Math.max(0, sizeDelta),
        })
        .onConflictDoUpdate({
          target: userStorage.userId,
          set: {
            usedStorage: sql`MAX(0, ${userStorage.usedStorage} + ${sizeDelta})`,
          },
        })
    }

    const [updated] = await db
      .select({
        id: storageFile.id,
        name: storageFile.name,
        objectKey: storageFile.objectKey,
        mimeType: storageFile.mimeType,
        sizeInBytes: storageFile.sizeInBytes,
        createdAt: storageFile.createdAt,
        folderId: storageFile.folderId,
      })
      .from(storageFile)
      .where(eq(storageFile.id, existing.id))
      .limit(1)

    return updated
  }

  const { selectProviderForUpload } = await import('@/lib/s3-provider-client')
  const provider = await selectProviderForUpload(fileSize)
  const objectKey = buildStorageObjectKey(userId, trimmedFileName)

  await provider.client.send(
    new PutObjectCommand({
      Bucket: provider.bucketName,
      Key: objectKey,
      Body: fileBytes,
      ContentType: mimeType,
    }),
  )

  const inheritedLock = await getInheritedPrivateLock(
    userId,
    input.parentFolderId,
  )
  const [created] = await db
    .insert(storageFile)
    .values({
      name: trimmedFileName,
      objectKey,
      mimeType,
      sizeInBytes: fileSize,
      userId,
      folderId: input.parentFolderId,
      providerId: provider.providerId,
      isPrivatelyLocked: inheritedLock,
      lastModified: new Date(),
    })
    .returning({
      id: storageFile.id,
      name: storageFile.name,
      objectKey: storageFile.objectKey,
      mimeType: storageFile.mimeType,
      sizeInBytes: storageFile.sizeInBytes,
      createdAt: storageFile.createdAt,
      folderId: storageFile.folderId,
    })

  await db
    .insert(userStorage)
    .values({
      userId,
      usedStorage: fileSize,
    })
    .onConflictDoUpdate({
      target: userStorage.userId,
      set: {
        usedStorage: sql`${userStorage.usedStorage} + ${fileSize}`,
      },
    })

  return created
}
