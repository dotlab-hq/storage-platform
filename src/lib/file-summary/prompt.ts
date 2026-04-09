import { formatBytes } from '@/lib/format-bytes'
import type { FileSummaryTarget } from './types'
import type { FileSummarySourceProfile } from './source'

type PromptInput = {
  target: FileSummaryTarget
  source: FileSummarySourceProfile
  textExcerpt: string
  textWasTruncated: boolean
  maxInputChars: number
}

export type BuiltSummaryPrompt = {
  systemPrompt: string
  userPrompt: string
  modelInputChars: number
  textWasTruncated: boolean
}

const SYSTEM_PROMPT =
  'You summarize files for a cloud storage UI. Be factual and concise. Do not invent details that are not present in metadata or excerpt content.'

function createMetadataBlock(target: FileSummaryTarget): string {
  const extension = target.name.includes('.')
    ? target.name.slice(target.name.lastIndexOf('.') + 1).toLowerCase()
    : 'none'

  return [
    `- Name: ${target.name}`,
    `- Extension: ${extension}`,
    `- MIME type: ${target.mimeType ?? 'unknown'}`,
    `- Size: ${target.sizeInBytes} bytes (${formatBytes(target.sizeInBytes)})`,
    `- Provider: ${target.providerName ?? 'unknown'}`,
    `- Bucket: ${target.bucketName ?? 'unknown'}`,
    `- Created at: ${target.createdAt.toISOString()}`,
    `- Updated at: ${target.updatedAt.toISOString()}`,
  ].join('\n')
}

function sourceGuidance(source: FileSummarySourceProfile): string {
  if (source.isLargeFile) {
    return [
      'The file is large. Summarize only from metadata and lifecycle signals.',
      'Mention that this is a metadata-wave summary and content was not fully read.',
    ].join(' ')
  }

  if (source.sourceType === 'text-content') {
    return [
      'The file is small and text-based.',
      'Use the provided excerpt and metadata only.',
      'Do not infer content that is not present.',
    ].join(' ')
  }

  if (source.sourceType === 'media-metadata') {
    return [
      'The file is a media asset.',
      'Summarize likely purpose from metadata only.',
      'Do not describe visual/audio content you cannot verify.',
    ].join(' ')
  }

  return [
    'The file is non-text or unknown binary.',
    'Summarize only from metadata and storage context.',
  ].join(' ')
}

function clipExcerpt(excerpt: string, maxChars: number): string {
  if (maxChars <= 0) return ''
  if (excerpt.length <= maxChars) return excerpt
  return `${excerpt.slice(0, maxChars)}\n...[truncated by model input limits]`
}

export function buildSummaryPrompt(input: PromptInput): BuiltSummaryPrompt {
  const metadataBlock = createMetadataBlock(input.target)
  const waveBlock = input.source.waves.map((wave) => `- ${wave}`).join('\n')
  const prelude = [
    'Summarize this file in 3-4 short sentences for an in-product card.',
    sourceGuidance(input.source),
    '',
    'File metadata:',
    metadataBlock,
    '',
    'Workflow waves:',
    waveBlock,
    '',
    'Output constraints:',
    '- Keep under 120 words.',
    '- Mention whether this is content-based or metadata-based.',
    '- Return plain text only.',
  ].join('\n')

  const availableForExcerpt = Math.max(0, input.maxInputChars - prelude.length)
  const clippedExcerpt = clipExcerpt(input.textExcerpt, availableForExcerpt)

  const userPrompt = clippedExcerpt
    ? [
        prelude,
        '',
        'Text excerpt:',
        clippedExcerpt,
        input.textWasTruncated
          ? '(Excerpt may be partial due to file-size limits.)'
          : '',
      ]
        .filter((line) => line.length > 0)
        .join('\n')
    : prelude

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    modelInputChars: SYSTEM_PROMPT.length + userPrompt.length,
    textWasTruncated:
      input.textWasTruncated ||
      clippedExcerpt.length < input.textExcerpt.length,
  }
}
