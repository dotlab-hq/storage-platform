import { WorkflowEntrypoint } from 'cloudflare:workflows'
import type { ExecutionContext } from 'cloudflare:workers'
import { processDeletionBatch } from './deletion-processor'
import type { DeletionWorkflowParams } from './params'

export class TrashDeletionWorkflow extends WorkflowEntrypoint<
  Env,
  DeletionWorkflowParams
> {
  async run(
    payload: DeletionWorkflowParams,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    const items = payload.items
    if (!items || items.length === 0) return

    // Get the queue binding to enqueue descendants
    const queue = env.TRASH_DELETION_QUEUE

    // Process this batch; any failures will retry automatically
    await processDeletionBatch(items, queue)
  }
}
