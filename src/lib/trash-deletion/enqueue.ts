import { eq, and, inArray, isNull } from 'drizzle-orm'
import { db } from '@/db'
import { file, folder } from '@/db/schema/storage'
import type { TrashDeletionItem } from './params'
import { enqueueTrashDeletionItems } from './producer'

/**
 * Get top-level deleted items not yet queued.
 * Returns only items whose parent (if any) is NOT in trash.
 * These are the entry points for deletion.
 */
export async function getDeletableItems(
  limit: number = 1000,
): Promise<TrashDeletionItem[]> {
  const items: TrashDeletionItem[] = []

  const candidateFolders = await db
    .select({
      id: folder.id,
      userId: folder.userId,
      parentFolderId: folder.parentFolderId,
    })
    .from(folder)
    .where(and(eq(folder.isDeleted, true), isNull(folder.deletionQueuedAt)))
    .limit(limit)

  for (const f of candidateFolders) {
    if (!f.parentFolderId) {
      items.push({ userId: f.userId, itemId: f.id, itemType: 'folder' })
      continue
    }
    const parent = await db
      .select({ id: folder.id, isDeleted: folder.isDeleted })
      .from(folder)
      .where(eq(folder.id, f.parentFolderId))
      .limit(1)
    if (parent.length === 0 || !parent[0].isDeleted) {
      items.push({ userId: f.userId, itemId: f.id, itemType: 'folder' })
    }
  }

  const candidateFiles = await db
    .select({
      id: file.id,
      userId: file.userId,
      folderId: file.folderId,
    })
    .from(file)
    .where(and(eq(file.isDeleted, true), isNull(file.deletionQueuedAt)))
    .limit(limit)

  for (const f of candidateFiles) {
    if (!f.folderId) {
      items.push({ userId: f.userId, itemId: f.id, itemType: 'file' })
      continue
    }
    const parent = await db
      .select({ id: folder.id, isDeleted: folder.isDeleted })
      .from(folder)
      .where(eq(folder.id, f.folderId))
      .limit(1)
    if (parent.length === 0 || !parent[0].isDeleted) {
      items.push({ userId: f.userId, itemId: f.id, itemType: 'file' })
    }
  }

  return items
}

/**
 * Recursively get all descendant files and folders of a folder.
 * Returns flat list of items (does NOT include the root folder itself).
 */
export async function getAllDescendants(
  rootFolderId: string,
  userId: string,
): Promise<TrashDeletionItem[]> {
  const descendants: TrashDeletionItem[] = []
  const stack: string[] = [rootFolderId]

  while (stack.length > 0) {
    const folderId = stack.pop()!

    const childFiles = await db
      .select({ id: file.id })
      .from(file)
      .where(eq(file.folderId, folderId))

    for (const f of childFiles) {
      descendants.push({ userId, itemId: f.id, itemType: 'file' })
    }

    const childFolders = await db
      .select({ id: folder.id })
      .from(folder)
      .where(eq(folder.parentFolderId, folderId))

    for (const f of childFolders) {
      descendants.push({ userId, itemId: f.id, itemType: 'folder' })
      stack.push(f.id)
    }
  }

  return descendants
}

/**
 * Build a deletion batch from top-level items.
 * For each top-level folder, expands all its descendants and claims them.
 * Respects maxBatchSize by including whole subtrees only if they fit.
 * Returns the list of items to enqueue (all claimed).
 */
export async function buildAndClaimDeletionBatch(
  topLevelItems: TrashDeletionItem[],
  maxBatchSize: number = 75,
): Promise<TrashDeletionItem[]> {
  let slotsUsed = 0
  const candidateItems: TrashDeletionItem[] = []
  const candidateFileIds: string[] = []
  const candidateFolderIds: string[] = []

  // First pass: decide which subtrees to include based on raw size
  for (const item of topLevelItems) {
    if (slotsUsed >= maxBatchSize) break

    if (item.itemType === 'file') {
      candidateItems.push(item)
      candidateFileIds.push(item.itemId)
      slotsUsed++
    } else {
      // Folder: get all descendants
      const descendants = await getAllDescendants(item.itemId, item.userId)
      const needed = 1 + descendants.length // folder itself + descendants
      if (slotsUsed + needed > maxBatchSize) {
        console.log(
          `[Enqueue] Skipping folder ${item.itemId} - subtree size ${needed} exceeds remaining capacity ${maxBatchSize - slotsUsed}`,
        )
        continue
      }
      // Add descendants first (children/subfolders)
      for (const desc of descendants) {
        candidateItems.push(desc)
        if (desc.itemType === 'file') candidateFileIds.push(desc.itemId)
        else candidateFolderIds.push(desc.itemId)
      }
      // Then add the folder itself (ensures children appear before parent)
      candidateItems.push(item)
      candidateFolderIds.push(item.itemId)
      slotsUsed += needed
    }
  }

  if (candidateItems.length === 0) return []

  // Fetch current DB state for candidate IDs
  const [fileRows, folderRows] = await Promise.all([
    candidateFileIds.length > 0
      ? db
          .select({
            id: file.id,
            isDeleted: file.isDeleted,
            deletionQueuedAt: file.deletionQueuedAt,
          })
          .from(file)
          .where(inArray(file.id, candidateFileIds))
      : Promise.resolve([] as any[]),
    candidateFolderIds.length > 0
      ? db
          .select({
            id: folder.id,
            isDeleted: folder.isDeleted,
            deletionQueuedAt: folder.deletionQueuedAt,
          })
          .from(folder)
          .where(inArray(folder.id, candidateFolderIds))
      : Promise.resolve([] as any[]),
  ])

  const fileStateMap = new Map(fileRows.map((r: any) => [r.id, r]))
  const folderStateMap = new Map(folderRows.map((r: any) => [r.id, r]))

  const now = new Date()
  const finalBatch: TrashDeletionItem[] = []
  const filesToSoftDelete: string[] = []
  const filesToClaim: string[] = []
  const foldersToSoftDelete: string[] = []
  const foldersToClaim: string[] = []

  for (const item of candidateItems) {
    const state =
      item.itemType === 'file'
        ? fileStateMap.get(item.itemId)
        : folderStateMap.get(item.itemId)
    if (!state) continue // already gone

    // Skip if already claimed
    if (state.deletionQueuedAt !== null) continue

    finalBatch.push(item)

    if (item.itemType === 'file') {
      if (state.isDeleted) {
        filesToClaim.push(item.itemId)
      } else {
        filesToSoftDelete.push(item.itemId)
      }
    } else {
      if (state.isDeleted) {
        foldersToClaim.push(item.itemId)
      } else {
        foldersToSoftDelete.push(item.itemId)
      }
    }
  }

  // Perform batched updates with conditions to avoid race conditions
  if (filesToSoftDelete.length > 0) {
    await db
      .update(file)
      .set({
        isDeleted: true,
        isTrashed: false,
        deletedAt: now,
        deletionQueuedAt: now,
        updatedAt: now,
      })
      .where(
        and(
          inArray(file.id, filesToSoftDelete),
          eq(file.isDeleted, false),
          isNull(file.deletionQueuedAt),
        ),
      )
  }

  if (filesToClaim.length > 0) {
    await db
      .update(file)
      .set({ deletionQueuedAt: now, updatedAt: now })
      .where(
        and(
          inArray(file.id, filesToClaim),
          eq(file.isDeleted, true),
          isNull(file.deletionQueuedAt),
        ),
      )
  }

  if (foldersToSoftDelete.length > 0) {
    await db
      .update(folder)
      .set({
        isDeleted: true,
        isTrashed: false,
        deletedAt: now,
        deletionQueuedAt: now,
        updatedAt: now,
      })
      .where(
        and(
          inArray(folder.id, foldersToSoftDelete),
          eq(folder.isDeleted, false),
          isNull(folder.deletionQueuedAt),
        ),
      )
  }

  if (foldersToClaim.length > 0) {
    await db
      .update(folder)
      .set({ deletionQueuedAt: now, updatedAt: now })
      .where(
        and(
          inArray(folder.id, foldersToClaim),
          eq(folder.isDeleted, true),
          isNull(folder.deletionQueuedAt),
        ),
      )
  }

  return finalBatch
}

/**
 * Enqueue items to the Cloudflare Queue (legacy; used by other callers).
 */
export async function enqueueItems(
  queue: { send: (msg: TrashDeletionItem) => Promise<void> },
  items: TrashDeletionItem[],
): Promise<number> {
  return enqueueTrashDeletionItems(queue, items)
}

/**
 * Claim items for queue handoff by setting deletionQueuedAt.
 * (Kept for backward compatibility; not used by new cron path)
 */
export async function claimItems(items: TrashDeletionItem[]): Promise<number> {
  if (items.length === 0) return 0

  const now = new Date()

  const fileIds = items
    .filter((i) => i.itemType === 'file')
    .map((i) => i.itemId)
  const folderIds = items
    .filter((i) => i.itemType === 'folder')
    .map((i) => i.itemId)

  let affected = 0

  if (fileIds.length > 0) {
    const result = await db
      .update(file)
      .set({ deletionQueuedAt: now, updatedAt: now })
      .where(inArray(file.id, fileIds))
    affected += (result as any).changes ?? 0
  }

  if (folderIds.length > 0) {
    const result = await db
      .update(folder)
      .set({ deletionQueuedAt: now, updatedAt: now })
      .where(inArray(folder.id, folderIds))
    affected += (result as any).changes ?? 0
  }

  return affected
}
