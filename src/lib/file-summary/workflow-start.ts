import {
  appendSummaryEvent,
  markSummaryJobFailed,
  markSummaryJobProcessing,
} from './jobs'
import { getWorkflowBindingFromRequestContext } from './request-context'
import type { FileSummaryWorkflowParams } from './workflow-params'

export async function triggerFileSummaryWorkflow(
  params: FileSummaryWorkflowParams,
): Promise<string> {
  const workflowBinding = getWorkflowBindingFromRequestContext()
  const workflowInstanceId = `summary-${params.jobId}`

  try {
    await workflowBinding.create({
      id: workflowInstanceId,
      params,
    })

    await markSummaryJobProcessing(params.jobId)
    await appendSummaryEvent(
      params.jobId,
      'processing',
      'Workflow instance started.',
      {
        workflowInstanceId,
      },
    )

    return workflowInstanceId
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : 'Workflow start failed.'
    await markSummaryJobFailed(params.jobId, reason, 0)
    throw error
  }
}
