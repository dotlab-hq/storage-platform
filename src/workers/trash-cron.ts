import { eq, and, isNull, sql } from 'drizzle-orm'
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
  const candidates = await getDeletableItems(1000)

  if (candidates.length === 0) {
    console.log('[Trash Cron] No items ready for permanent deletion')
    return
  }

  const toEnqueue: TrashDeletionItem[] = []
  const now = new Date()

  for (let i = 0; i < Math.min(candidates.length, BATCH_SIZE); i++) {
    const item = candidates[i]
    const table = item.itemType === 'file' ? file : folder
    const idColumn = item.itemType === 'file' ? file.id : folder.id
    const userIdColumn = item.itemType === 'file' ? file.userId : folder.userId
    const isTrashedCol =
      item.itemType === 'file' ? file.isTrashed : folder.isTrashed
    const deletedAtCol =
      item.itemType === 'file' ? file.deletedAt : folder.deletedAt
    const queuedAtCol =
      item.itemType === 'file' ? file.deletionQueuedAt : folder.deletionQueuedAt

    const result = await db
      .update(table)
      .set({ deletionQueuedAt: now })
      .where(
        and(
          eq(idColumn, item.itemId),
          eq(userIdColumn, item.userId),
          eq(isTrashedCol, false),
          sql`${deletedAtCol} IS NOT NULL`,
          isNull(queuedAtCol),
        ),
      )

    if (result.changes && result.changes > 0) {
      toEnqueue.push(item)
    }
  }

  if (toEnqueue.length > 0) {
    const sent = await enqueueItems(env.TRASH_DELETION_QUEUE, toEnqueue)
    console.log(
      `[Trash Cron] Enqueued ${sent}/${toEnqueue.length} items for deletion`,
    )
  } else {
    console.log(
      '[Trash Cron] No items could be claimed (possibly already claimed)',
    )
  }
}
