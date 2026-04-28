import type { TrashDeletionItem } from '@/lib/trash-deletion/params'
import {
  claimItems,
  enqueueItems,
  getDeletableItems,
} from '@/lib/trash-deletion/enqueue'

const BATCH_SIZE = 75

export async function scheduled(
  _event: ScheduledController,
  env: Env,
  _ctx: ExecutionContext,
): Promise<void> {
  const candidates = await getDeletableItems(1000)

  console.log('[Trash Cron] Candidates found:', candidates.length)
  if (candidates.length > 0) {
    console.log('[Trash Cron] First 3 items:', candidates.slice(0, 3))
  }

  if (candidates.length === 0) {
    console.log('[Trash Cron] No items ready for permanent deletion')
    return
  }

  const toEnqueue: TrashDeletionItem[] = []
  for (let i = 0; i < Math.min(candidates.length, BATCH_SIZE); i++) {
    toEnqueue.push(candidates[i])
  }

  const claimed = await claimItems(toEnqueue)
  if (claimed > 0) {
    const sent = await enqueueItems(env.TRASH_DELETION_QUEUE, toEnqueue)
    console.log(
      `[Trash Cron] Claimed ${claimed} items and enqueued ${sent}/${toEnqueue.length} for deletion`,
    )
    return
  }

  console.log('[Trash Cron] No items could be claimed (possibly already claimed)')
}
