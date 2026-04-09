import { WorkflowEntrypoint } from 'cloudflare:workers'
import { runFileSummaryWorkflow } from './workflow-runner'
import type { FileSummaryWorkflowParams } from './workflow-params'

export class FileSummaryWorkflow extends WorkflowEntrypoint<
  Env,
  FileSummaryWorkflowParams
> {
  async run(
    event: Readonly<{ payload: FileSummaryWorkflowParams }>,
  ): Promise<void> {
    await runFileSummaryWorkflow(event.payload)
  }
}
