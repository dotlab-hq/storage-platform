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

    const env = this.env as Env
    const queue = env.TRASH_DELETION_QUEUE

    await processDeletionBatch(items, env, queue)
  }
}
