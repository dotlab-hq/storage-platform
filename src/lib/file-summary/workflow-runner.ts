import { NonRetryableError } from 'cloudflare:workflows'
import {
  markSummaryJobAttempt,
  markSummaryJobCompleted,
  markSummaryJobFailed,
} from './jobs'
import { generateFileSummary } from './generate'
import { getSummaryTarget } from './target'
import type { FileSummaryWorkflowParams } from './workflow-params'

const MAX_ATTEMPTS = 3

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Unknown summary workflow error.'
}

export async function runFileSummaryWorkflow(
  params: FileSummaryWorkflowParams,
): Promise<void> {
  let lastError = 'Summary generation failed.'

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    await markSummaryJobAttempt(params.jobId, attempt)

    try {
      const target = await getSummaryTarget(params.fileId, params.userId)
      const generatedSummary = await generateFileSummary(target)
      await markSummaryJobCompleted(params.jobId, generatedSummary, attempt)
      return
    } catch (error) {
      lastError = toErrorMessage(error)

      if (attempt >= MAX_ATTEMPTS) {
        await markSummaryJobFailed(params.jobId, lastError, attempt)
        throw new NonRetryableError(lastError)
      }

      await new Promise((resolve) => {
        setTimeout(resolve, attempt * 1000)
      })
    }
  }
}
