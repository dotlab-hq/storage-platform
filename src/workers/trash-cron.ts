import { eq, and, inArray, isNull } from 'drizzle-orm'
import { db } from '@/db'
import { file, folder } from '@/db/schema/storage'
import type { TrashDeletionItem } from '@/lib/trash-deletion/params'

const BATCH_SIZE = 75

export async function scheduled(
  _event: ScheduledController,
  env: Env,
  _ctx: ExecutionContext,
): Promise<void> {
  // --- getDeletableItems logic ---
  const items: TrashDeletionItem[] = []
  const limit = 1000
  console.log('Querying for deleted items with no queue handoff...')
  const candidateFolders = await db
    .select({
      id: folder.id,
      userId: folder.userId,
      parentFolderId: folder.parentFolderId,
    })
    .from(folder)
    .where(and(eq(folder.isDeleted, true), isNull(folder.deletionQueuedAt)))
    .limit(limit)
  console.log('Candidate folders found:', candidateFolders.length)
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
  console.log('Candidate files found:', candidateFiles.length)
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
  console.log('Total deletable items:', items.length)
  if (items.length > 0) {
    console.log('Sample item:', items[0])
  }
  // --- end getDeletableItems logic ---

  const candidates = items
  console.log('[Trash Cron] Candidates found:', candidates.length)
  if (candidates.length > 0) {
    console.log('[Trash Cron] First 3 items:', candidates.slice(0, 3))
  }
  if (candidates.length === 0) {
    console.log('[Trash Cron] No items ready for permanent deletion')
    return
  }

  // --- batching ---
  const toEnqueue: TrashDeletionItem[] = []
  for (let i = 0; i < Math.min(candidates.length, BATCH_SIZE); i++) {
    toEnqueue.push(candidates[i])
  }

  // --- claimItems logic ---
  if (toEnqueue.length === 0) {
    console.log('[Trash Cron] No items to claim')
    return
  }
  const now = new Date()
  const fileIds = toEnqueue
    .filter((i) => i.itemType === 'file')
    .map((i) => i.itemId)
  const folderIds = toEnqueue
    .filter((i) => i.itemType === 'folder')
    .map((i) => i.itemId)
  let affected = 0
  if (fileIds.length > 0) {
    const result = await db
      .update(file)
      .set({
        isDeleted: true,
        deletedAt: now,
        deletionQueuedAt: now,
        updatedAt: now,
      })
      .where(inArray(file.id, fileIds))
    affected += result.changes ?? 0
  }
  if (folderIds.length > 0) {
    const result = await db
      .update(folder)
      .set({
        isDeleted: true,
        deletedAt: now,
        deletionQueuedAt: now,
        updatedAt: now,
      })
      .where(inArray(folder.id, folderIds))
    affected += result.changes ?? 0
  }
  const claimed = affected
  console.log('[Trash Cron] Items claimed for processing:', claimed)
  if (claimed > 0) {
    await env.TRASH_DELETION_QUEUE.sendBatch(toEnqueue)
    console.log(
      `[Trash Cron] Claimed ${claimed} items and enqueued ${toEnqueue.length} for deletion`,
    )
    return
  }
  console.log(
    '[Trash Cron] No items could be claimed (possibly already claimed)',
  )
}
