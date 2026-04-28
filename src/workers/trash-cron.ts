import { eq, and, isNull } from 'drizzle-orm'
import { db } from '@/db'
import { file, folder } from '@/db/schema/storage'
import type { TrashDeletionItem } from '@/lib/trash-deletion/params'
import { getDeletableItems, enqueueItems } from '@/lib/trash-deletion/enqueue'

const BATCH_SIZE = 75

export async function scheduled(
  event: ScheduledEvent,
  env: Env,
  ctx: ExecutionContext,
): Promise<void> {
  // Step 1: Get candidate items (up to 1000 to have a pool)
  const candidates = await getDeletableItems(1000)

  if (candidates.length === 0) {
    console.log('No trash items ready for deletion')
    return
  }

  // Step 2: Claim items atomically, one by one, up to BATCH_SIZE
  const toEnqueue: TrashDeletionItem[] = []
  const now = new Date()

  for (let i = 0; i < Math.min(candidates.length, BATCH_SIZE); i++) {
    const item = candidates[i]
    const table = item.itemType === 'file' ? db.file : db.folder
    const idColumn = item.itemType === 'file' ? db.file.id : db.folder.id
    const userIdColumn =
      item.itemType === 'file' ? db.file.userId : db.folder.userId
    const isDeletedCol =
      item.itemType === 'file' ? db.file.isDeleted : db.folder.isDeleted
    const isTrashedCol =
      item.itemType === 'file' ? db.file.isTrashed : db.folder.isTrashed
    const queuedAtCol =
      item.itemType === 'file'
        ? db.file.deletionQueuedAt
        : db.folder.deletionQueuedAt

    const result = await db
      .update(table)
      .set({ deletionQueuedAt: now })
      .where(
        and(
          eq(idColumn, item.itemId),
          eq(userIdColumn, item.userId),
          eq(isDeletedCol, true),
          eq(isTrashedCol, false),
          isNull(queuedAtCol),
        ),
      )

    if result.changes && result.changes > 0) {
      toEnqueue.push(item)
    }
  }

  // Step 3: Enqueue claimed items to the queue
  if (toEnqueue.length > 0) {
    const sent = await enqueueItems(env.TRASH_DELETION_QUEUE, toEnqueue)
    console.log(`Enqueued ${sent}/${toEnqueue.length} items for deletion`)
  } else {
    console.log('No items were claimed (possibly already claimed by another run)')
  }
}
