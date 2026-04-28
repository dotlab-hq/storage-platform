import type { TrashDeletionItem } from '@/lib/trash-deletion/params'

export async function queue(
  batch: MessageBatch<unknown>,
  env: Env,
  _ctx: ExecutionContext,
): Promise<void> {
  // Aggregate items from all messages
  const items: TrashDeletionItem[] = []
  for (const msg of batch.messages) {
    try {
      // Queue messages are sent as JSON strings
      const item = JSON.parse(msg.body as string) as TrashDeletionItem
      items.push(item)
    } catch (err) {
      console.error('Failed to parse queue message:', err)
      throw err
    }
  }
  }

  if (items.length === 0) return

  // Group into workflow batches (max 75 items)
  const BATCH_SIZE = 75
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const chunk = items.slice(i, i + BATCH_SIZE)
    try {
      await env.TRASH_DELETION_WORKFLOW.create({
        params: { items: chunk },
      })
    } catch (err) {
      console.error('Failed to create workflow batch:', err)
      throw err // Will trigger retry for these messages
    }
  }
}

// Export the workflow class so Wrangler can bind it
export { TrashDeletionWorkflow } from '@/lib/trash-deletion/deletion-workflow'
