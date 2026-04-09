import { createSummaryModelClient } from './ollama-client'
import { getFileSummaryLimits } from './config'
import { loadTextExcerptForSummary } from './content'
import { buildSummaryPrompt } from './prompt'
import { createSourceProfile, shouldLoadTextExcerpt } from './source'
import type { FileSummaryTarget, GeneratedSummary } from './types'

function cleanSummaryText(rawValue: string): string {
  return rawValue.trim().replace(/\s+/g, ' ')
}

export async function generateFileSummary(
  target: FileSummaryTarget,
): Promise<GeneratedSummary> {
  const limits = getFileSummaryLimits()
  const source = createSourceProfile(target, limits.largeFileBytes)

  const excerptResult = shouldLoadTextExcerpt(target, source)
    ? await loadTextExcerptForSummary(target, limits.maxTextBytes)
    : { text: '', bytesRead: 0, wasTruncated: false }

  const prompt = buildSummaryPrompt({
    target,
    source,
    textExcerpt: excerptResult.text,
    textWasTruncated: excerptResult.wasTruncated,
    maxInputChars: limits.maxInputChars,
  })

  const model = createSummaryModelClient()
  const aiMessage = await model.invoke([
    ['system', prompt.systemPrompt],
    ['human', prompt.userPrompt],
  ])

  const summaryText = cleanSummaryText(
    typeof aiMessage.content === 'string'
      ? aiMessage.content
      : JSON.stringify(aiMessage.content),
  )

  if (!summaryText) {
    throw new Error('Model returned an empty summary.')
  }

  return {
    summaryText,
    sourceType: source.sourceType,
    isLargeFile: source.isLargeFile,
    metadata: {
      fileName: target.name,
      extension: source.extension,
      mimeType: target.mimeType,
      sizeInBytes: target.sizeInBytes,
      providerName: target.providerName,
      bucketName: target.bucketName,
      waves: source.waves,
      bytesReadForSummary: excerptResult.bytesRead,
      textWasTruncated: prompt.textWasTruncated,
      modelInputChars: prompt.modelInputChars,
      maxInputChars: limits.maxInputChars,
    },
  }
}
