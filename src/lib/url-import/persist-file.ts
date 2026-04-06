import { DEFAULT_FILE_SIZE_LIMIT_BYTES } from '@/lib/storage-quota-constants'

type RegisterImportedFileInput = {
  userId: string
  fileName: string
  objectKey: string
  mimeType: string | null
  fileSize: number
  parentFolderId: string | null
  providerId: string | null
}

type RegisteredFile = {
  id: string
  name: string
  mimeType: string | null
  sizeInBytes: number
  objectKey: string
  createdAt: Date
}

export async function registerImportedFile(
  input: RegisterImportedFileInput,
): Promise<RegisteredFile> {
  const [
    { db },
    { file: storageFile, folder, userStorage },
    { resolveProviderId },
  ] = await Promise.all([
    import('@/db'),
    import('@/db/schema/storage'),
    import('@/lib/s3-provider-client'),
  ])
  const { and, eq, sql } = await import('drizzle-orm')

  const storageRows = await db
    .select({ fileSizeLimit: userStorage.fileSizeLimit })
    .from(userStorage)
    .where(eq(userStorage.userId, input.userId))
    .limit(1)
  const fileSizeLimit =
    storageRows[0]?.fileSizeLimit ?? DEFAULT_FILE_SIZE_LIMIT_BYTES

  if (input.fileSize > fileSizeLimit) {
    throw new Error(
      `File exceeds maximum allowed size (${fileSizeLimit} bytes)`,
    )
  }

  let isPrivatelyLocked = false
  if (input.parentFolderId) {
    const parentRows = await db
      .select({ isPrivatelyLocked: folder.isPrivatelyLocked })
      .from(folder)
      .where(
        and(
          eq(folder.id, input.parentFolderId),
          eq(folder.userId, input.userId),
        ),
      )
      .limit(1)
    if (parentRows.length > 0) {
      isPrivatelyLocked = parentRows[0].isPrivatelyLocked
    }
  }

  const resolvedProviderId = await resolveProviderId(input.providerId)

  const [insertedFile] = await db
    .insert(storageFile)
    .values({
      name: input.fileName,
      objectKey: input.objectKey,
      mimeType: input.mimeType,
      sizeInBytes: input.fileSize,
      userId: input.userId,
      folderId: input.parentFolderId,
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

  await db
    .insert(userStorage)
    .values({
      userId: input.userId,
      usedStorage: input.fileSize,
    })
    .onConflictDoUpdate({
      target: userStorage.userId,
      set: {
        usedStorage: sql`${userStorage.usedStorage} + ${input.fileSize}`,
      },
    })

  return insertedFile
}
