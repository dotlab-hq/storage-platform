import {
  getDeletableItems,
  buildAndClaimDeletionBatch,
} from '@/lib/trash-deletion/enqueue'

const BATCH_SIZE = 75

export async function scheduled(
  _event: ScheduledController,
  env: Env,
  _ctx: ExecutionContext,
): Promise<void> {
  // Step 1: Get only TOP-LEVEL items (no parent-checking in cron)
  const topLevelItems = await getDeletableItems(1000)

  console.log('[Trash Cron] Top-level candidates found:', topLevelItems.length)
  if (topLevelItems.length > 0) {
    console.log(
      '[Trash Cron] First 3 top-level items:',
      topLevelItems.slice(0, 3),
    )
  }

  if (topLevelItems.length === 0) {
    console.log('[Trash Cron] No top-level items ready for deletion')
    return
  }

  // Step 2: Build full batch (expand folders recursively) and claim ALL items
  const fullBatch = await buildAndClaimDeletionBatch(topLevelItems, BATCH_SIZE)

  if (fullBatch.length === 0) {
    console.log('[Trash Cron] Nothing to enqueue after building batch')
    return
  }

  // Step 3: Enqueue the full batch
  await env.TRASH_DELETION_QUEUE.sendBatch(
    fullBatch.map((item) => ({ body: JSON.stringify(item) })),
  )

  console.log(
    `[Trash Cron] Enqueued ${fullBatch.length} items (including all descendants)`,
  )
}
