import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { requireAdminUser } from '@/lib/server-auth.server'

export const Route = createFileRoute('/api/admin/trigger-cron')({
  server: {
    handler: async ({ context }) => {
      try {
        // Admin authentication only
        const adminUser = await requireAdminUser()
        console.log('[Manual Cron Trigger] Admin user:', adminUser.id)

        // Get queue from environment
        const queue = context?.env?.TRASH_DELETION_QUEUE
        if (!queue) {
          return json({ error: 'Queue not available' }, { status: 500 })
        }

        // Fetch top-level candidate items
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
          return json({
            triggered: false,
            message: 'No items ready for deletion',
          })
        }

        // Build batch with default batch size 75
        const fullBatch = await buildAndClaimDeletionBatch(topLevelItems, 75)

        if (fullBatch.length === 0) {
          return json({
            triggered: false,
            message: 'No items to enqueue after batch build',
          })
        }

        // Enqueue to TRASH_DELETION_QUEUE
        await queue.sendBatch(
          fullBatch.map((item) => ({ body: JSON.stringify(item) })),
        )

        console.log(
          `[Manual Cron Trigger] Enqueued ${fullBatch.length} items (including all descendants)`,
        )

        return json({
          triggered: true,
          enqueuedCount: fullBatch.length,
          message: `Successfully enqueued ${fullBatch.length} items for deletion`,
        })
      } catch (error) {
        console.error('[Manual Cron Trigger] Error:', error)
        if (error instanceof Response) throw error
        return json(
          { error: error instanceof Error ? error.message : 'Unknown error' },
          { status: 500 },
        )
      }
    },
  },
})
