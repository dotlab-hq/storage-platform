import type { WorkflowEvent, WorkflowStep } from 'cloudflare:workers'
import { WorkflowEntrypoint } from 'cloudflare:workers'
import { processDeletionBatch } from './deletion-processor'
import type { DeletionWorkflowParams } from './params'

export class TrashDeletionWorkflow extends WorkflowEntrypoint<
  Env,
  DeletionWorkflowParams
> {
  async run(
    event: Readonly<WorkflowEvent<DeletionWorkflowParams>>,
    step: WorkflowStep,
  ): Promise<void> {
    const items = event.payload?.items
    if (!items || items.length === 0) return

    // Use the bound env available on the entrypoint instance
    const queue = (this as any).env
      .TRASH_DELETION_QUEUE as Env['TRASH_DELETION_QUEUE']

    // Process this batch; any failures will retry automatically
    await processDeletionBatch(items, queue)
  }
}
