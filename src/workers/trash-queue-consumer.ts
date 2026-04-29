import type { TrashDeletionItem } from '@/lib/trash-deletion/params'

export async function queue(
  batch: MessageBatch<unknown>,
  env: Env,
  _ctx: ExecutionContext,
): Promise<void> {
  console.log(
    `[Queue Consumer] Received batch of ${batch.messages.length} message(s)`,
  )

  // Aggregate items from all messages
  const items: TrashDeletionItem[] = []
  for (const msg of batch.messages) {
    try {
      // Queue messages are sent as JSON strings
      const item = JSON.parse(msg.body as string) as TrashDeletionItem
      items.push(item)
      console.log('[Queue Consumer] Parsed item:', item)
    } catch (err) {
      console.error('Failed to parse queue message:', err, 'body:', msg.body)
      throw err
    }
  }

  if (items.length === 0) {
    console.log('[Queue Consumer] No items to process, acknowledging batch')
    return
  }

  console.log(
    `[Queue Consumer] Total items to enqueue to workflow: ${items.length}`,
  )

  // Group into workflow batches (max 75 items)
  const BATCH_SIZE = 75
  const numBatches = Math.ceil(items.length / BATCH_SIZE)
  console.log(`[Queue Consumer] Creating ${numBatches} workflow batch(es)`)

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const chunk = items.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    try {
      console.log(
        `[Queue Consumer] Creating workflow batch ${batchNum}/${numBatches} with ${chunk.length} items`,
      )
      await env.TRASH_DELETION_WORKFLOW.create({
        params: { items: chunk },
      })
      console.log(
        `[Queue Consumer] Successfully created workflow batch ${batchNum}`,
      )
    } catch (err) {
      console.error(
        `[Queue Consumer] Failed to create workflow batch ${batchNum}:`,
        err,
      )
      throw err // Will trigger retry for these messages
    }
  }
}

// Export the workflow class so Wrangler can bind it
export { TrashDeletionWorkflow } from '@/lib/trash-deletion/deletion-workflow'
