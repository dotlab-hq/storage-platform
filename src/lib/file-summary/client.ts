import { getLatestFileSummaryFn } from './queries'
import { requestFileSummaryFn } from './request'

const SUMMARY_POLL_INTERVAL_MS = 1200
const SUMMARY_MAX_POLL_ATTEMPTS = 20

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export async function generateFileSummaryForItem(
  fileId: string,
): Promise<string> {
  await requestFileSummaryFn({
    data: { fileId },
  })

  for (let attempt = 0; attempt < SUMMARY_MAX_POLL_ATTEMPTS; attempt += 1) {
    const { summary } = await getLatestFileSummaryFn({
      data: { fileId },
    })

    if (!summary) {
      await wait(SUMMARY_POLL_INTERVAL_MS)
      continue
    }

    if (summary.status === 'failed') {
      throw new Error(summary.failureReason ?? 'Summary generation failed.')
    }

    if (summary.status === 'completed' && summary.summaryText) {
      return summary.summaryText
    }

    await wait(SUMMARY_POLL_INTERVAL_MS)
  }

  throw new Error('Summary is still processing. Please try again shortly.')
}
