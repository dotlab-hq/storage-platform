import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getTrashDeletionQueueFromRequestContext } from '@/lib/trash-deletion/request-context'

const TriggerCronSchema = z.object({
  pass: z.string(),
})

/**
 * Manual trigger endpoint for trash deletion cron.
 * Requires CRON_PASS env variable to authenticate.
 *
 * Usage: POST /api/cron/trigger-trash
 * Body: { "pass": "its-me-boi" }
 */
export const triggerTrashCronFn = createServerFn({ method: 'POST' })
  .inputValidator(TriggerCronSchema)
  .handler(async ({ data, context }) => {
    // Verify CRON_PASS from environment
    const expectedPass = process.env.CRON_PASS
    if (!expectedPass || data.pass !== expectedPass) {
      // Don't reveal whether pass was wrong or env missing
      throw new Error('Unauthorized: Invalid cron trigger password')
    }

    // Get queue from request context (provided by TanStack Start)
    const queue = getTrashDeletionQueueFromRequestContext(context)

    // Fetch up to 100 top-level candidate items
    const { getDeletableItems, buildAndClaimDeletionBatch } =
      await import('@/lib/trash-deletion/enqueue')

    const topLevelItems = await getDeletableItems(100)

    console.log(
      '[Manual Cron Trigger] Top-level candidates found:',
      topLevelItems.length,
    )
    if (topLevelItems.length > 0) {
      console.log(
        '[Manual Cron Trigger] First 3 top-level items:',
        topLevelItems.slice(0, 3),
      )
    }

    if (topLevelItems.length === 0) {
      return { triggered: false, message: 'No items ready for deletion' }
    }

    // Build batch with default batch size 75
    const fullBatch = await buildAndClaimDeletionBatch(topLevelItems, 75)

    if (fullBatch.length === 0) {
      return {
        triggered: false,
        message: 'No items to enqueue after batch build',
      }
    }

    // Enqueue to TRASH_DELETION_QUEUE
    await queue.sendBatch(
      fullBatch.map((item) => ({ body: JSON.stringify(item) })),
    )

    console.log(
      `[Manual Cron Trigger] Enqueued ${fullBatch.length} items (including all descendants)`,
    )

    return {
      triggered: true,
      enqueuedCount: fullBatch.length,
      message: `Successfully enqueued ${fullBatch.length} items for deletion`,
    }
  })

/**
 * Manual trigger endpoint for trash deletion cron.
 * Requires CRON_PASS env variable to authenticate.
 *
 * Usage: POST /api/cron/trigger-trash
 * Body: { "pass": "its-me-boi" }
 */
export const triggerTrashCronFn = createServerFn({ method: 'POST' })
  .inputValidator(TriggerCronSchema)
  .handler(async ({ data }) => {
    // Verify CRON_PASS from environment
    const expectedPass = process.env.CRON_PASS
    if (!expectedPass || data.pass !== expectedPass) {
      // Don't reveal whether pass was wrong or env missing
      throw new Error('Unauthorized: Invalid cron trigger password')
    }

    // Fetch up to 100 top-level candidate items
    const { file: storageFile, folder } = await import('@/db/schema/storage')
    const { getDeletableItems } = await import('@/lib/trash-deletion/enqueue')

    const topLevelItems = await getDeletableItems(100)

    console.log(
      '[Manual Cron Trigger] Top-level candidates found:',
      topLevelItems.length,
    )
    if (topLevelItems.length > 0) {
      console.log(
        '[Manual Cron Trigger] First 3 top-level items:',
        topLevelItems.slice(0, 3),
      )
    }

    if (topLevelItems.length === 0) {
      return { triggered: false, message: 'No items ready for deletion' }
    }

    // Build batch with default batch size 75
    const { buildAndClaimDeletionBatch } =
      await import('@/lib/trash-deletion/enqueue')
    const fullBatch = await buildAndClaimDeletionBatch(topLevelItems, 75)

    if (fullBatch.length === 0) {
      return {
        triggered: false,
        message: 'No items to enqueue after batch build',
      }
    }

    // Enqueue to TRASH_DELETION_QUEUE
    const queue = (globalThis as any).env?.TRASH_DELETION_QUEUE
    if (!queue) {
      throw new Error('TRASH_DELETION_QUEUE not available in environment')
    }

    await queue.sendBatch(
      fullBatch.map((item) => ({ body: JSON.stringify(item) })),
    )

    console.log(
      `[Manual Cron Trigger] Enqueued ${fullBatch.length} items (including all descendants)`,
    )

    return {
      triggered: true,
      enqueuedCount: fullBatch.length,
      message: `Successfully enqueued ${fullBatch.length} items for deletion`,
    }
  })
