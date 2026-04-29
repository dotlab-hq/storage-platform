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
    _step: WorkflowStep,
  ): Promise<void> {
    const items = event.payload?.items
    if (!items || items.length === 0) return

    const env = this.env as Env

    await processDeletionBatch(items, env)
  }
}
