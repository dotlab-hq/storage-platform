import { eq, and } from 'drizzle-orm'

export async function createShareLink(
  userId: string,
  itemId: string,
  itemType: 'file' | 'folder',
  requiresAuth: boolean,
  consentedPrivatelyUnlock: boolean,
) {
  const [{ db }, { shareLink, file: storageFile, folder }] = await Promise.all([
    import('@/db'),
    import('@/db/schema/storage'),
  ])

  if (itemType === 'file') {
    const fileRows = await db
      .select({ isPrivatelyLocked: storageFile.isPrivatelyLocked })
      .from(storageFile)
      .where(and(eq(storageFile.id, itemId), eq(storageFile.userId, userId)))
      .limit(1)
    if (fileRows.length === 0) {
      throw new Error('File not found')
    }
    const fileRow = fileRows[0]
    if (fileRow.isPrivatelyLocked && !consentedPrivatelyUnlock) {
      throw new Error('Cannot share privately locked file without consent')
    }
  } else {
    const folderRows = await db
      .select({ isPrivatelyLocked: folder.isPrivatelyLocked })
      .from(folder)
      .where(and(eq(folder.id, itemId), eq(folder.userId, userId)))
      .limit(1)
    if (folderRows.length === 0) {
      throw new Error('Folder not found')
    }
  }

  // Check if an active share link already exists for this item
  const existing = await db
    .select()
    .from(shareLink)
    .where(
      itemType === 'file'
        ? and(
            eq(shareLink.fileId, itemId),
            eq(shareLink.sharedByUserId, userId),
          )
        : and(
            eq(shareLink.folderId, itemId),
            eq(shareLink.sharedByUserId, userId),
          ),
    )
    .limit(1)

  if (existing.length > 0) {
    // Update existing link
    const [updated] = await db
      .update(shareLink)
      .set({ requiresAuth, consentedPrivatelyUnlock, isActive: true })
      .where(eq(shareLink.id, existing[0].id))
      .returning()
    return updated
  }

  const token = generateShareToken()
  const [created] = await db
    .insert(shareLink)
    .values({
      fileId: itemType === 'file' ? itemId : null,
      folderId: itemType === 'folder' ? itemId : null,
      sharedByUserId: userId,
      shareToken: token,
      requiresAuth,
      consentedPrivatelyUnlock,
    })
    .returning()

  return created
}

export async function getShareLink(
  userId: string,
  itemId: string,
  itemType: 'file' | 'folder',
) {
  const [{ db }, { shareLink }] = await Promise.all([
    import('@/db'),
    import('@/db/schema/storage'),
  ])

  const rows = await db
    .select()
    .from(shareLink)
    .where(
      itemType === 'file'
        ? and(
            eq(shareLink.fileId, itemId),
            eq(shareLink.sharedByUserId, userId),
          )
        : and(
            eq(shareLink.folderId, itemId),
            eq(shareLink.sharedByUserId, userId),
          ),
    )
    .limit(1)

  return rows.length > 0 ? rows[0] : null
}

export async function toggleShareLink(
  userId: string,
  linkId: string,
  isActive: boolean,
) {
  const [{ db }, { shareLink }] = await Promise.all([
    import('@/db'),
    import('@/db/schema/storage'),
  ])

  const updatedRows = await db
    .update(shareLink)
    .set({ isActive })
    .where(and(eq(shareLink.id, linkId), eq(shareLink.sharedByUserId, userId)))
    .returning()

  return updatedRows.length > 0 ? updatedRows[0] : null
}

export async function updateShareAuth(
  userId: string,
  linkId: string,
  requiresAuth: boolean,
) {
  const [{ db }, { shareLink }] = await Promise.all([
    import('@/db'),
    import('@/db/schema/storage'),
  ])

  const updatedRows = await db
    .update(shareLink)
    .set({ requiresAuth })
    .where(and(eq(shareLink.id, linkId), eq(shareLink.sharedByUserId, userId)))
    .returning()

  return updatedRows.length > 0 ? updatedRows[0] : null
}

export async function deleteShareLink(userId: string, linkId: string) {
  const [{ db }, { shareLink }] = await Promise.all([
    import('@/db'),
    import('@/db/schema/storage'),
  ])

  await db
    .delete(shareLink)
    .where(and(eq(shareLink.id, linkId), eq(shareLink.sharedByUserId, userId)))
}

function generateShareToken(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 32)
}
