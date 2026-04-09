import type { FileSummaryJobSnapshot, FileSummaryMetadata } from './types'

const EMPTY_METADATA: FileSummaryMetadata = {
  fileName: '',
  extension: null,
  mimeType: null,
  sizeInBytes: 0,
  providerName: null,
  bucketName: null,
  waves: [],
  bytesReadForSummary: 0,
  textWasTruncated: false,
  modelInputChars: 0,
  maxInputChars: 0,
}

function toSafeNumber(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback
  }
  return value
}

export function parseSummaryMetadata(rawValue: string): FileSummaryMetadata {
  try {
    const parsed = JSON.parse(rawValue) as Partial<FileSummaryMetadata>
    return {
      ...EMPTY_METADATA,
      ...parsed,
      fileName:
        typeof parsed.fileName === 'string'
          ? parsed.fileName
          : EMPTY_METADATA.fileName,
      extension:
        typeof parsed.extension === 'string' || parsed.extension === null
          ? parsed.extension
          : EMPTY_METADATA.extension,
      mimeType:
        typeof parsed.mimeType === 'string' || parsed.mimeType === null
          ? parsed.mimeType
          : EMPTY_METADATA.mimeType,
      sizeInBytes: toSafeNumber(parsed.sizeInBytes, EMPTY_METADATA.sizeInBytes),
      providerName:
        typeof parsed.providerName === 'string' || parsed.providerName === null
          ? parsed.providerName
          : EMPTY_METADATA.providerName,
      bucketName:
        typeof parsed.bucketName === 'string' || parsed.bucketName === null
          ? parsed.bucketName
          : EMPTY_METADATA.bucketName,
      waves: Array.isArray(parsed.waves)
        ? parsed.waves.filter(
            (wave): wave is string => typeof wave === 'string',
          )
        : EMPTY_METADATA.waves,
      bytesReadForSummary: toSafeNumber(
        parsed.bytesReadForSummary,
        EMPTY_METADATA.bytesReadForSummary,
      ),
      textWasTruncated:
        typeof parsed.textWasTruncated === 'boolean'
          ? parsed.textWasTruncated
          : EMPTY_METADATA.textWasTruncated,
      modelInputChars: toSafeNumber(
        parsed.modelInputChars,
        EMPTY_METADATA.modelInputChars,
      ),
      maxInputChars: toSafeNumber(
        parsed.maxInputChars,
        EMPTY_METADATA.maxInputChars,
      ),
    }
  } catch {
    return EMPTY_METADATA
  }
}

export function stringifySummaryMetadata(
  metadata: FileSummaryMetadata,
): string {
  return JSON.stringify(metadata)
}

function toIsoOrNull(value: Date | null): string | null {
  return value ? value.toISOString() : null
}

type JobRow = {
  id: string
  fileId: string
  userId: string
  model: string
  status: string
  sourceType: string
  isLargeFile: boolean
  attempts: number
  summaryText: string | null
  metadataJson: string
  failureReason: string | null
  startedAt: Date | null
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export function toSummaryJobSnapshot(row: JobRow): FileSummaryJobSnapshot {
  return {
    id: row.id,
    fileId: row.fileId,
    userId: row.userId,
    model: row.model,
    status: row.status as FileSummaryJobSnapshot['status'],
    sourceType: row.sourceType as FileSummaryJobSnapshot['sourceType'],
    isLargeFile: row.isLargeFile,
    attempts: row.attempts,
    summaryText: row.summaryText,
    metadata: parseSummaryMetadata(row.metadataJson),
    failureReason: row.failureReason,
    startedAt: toIsoOrNull(row.startedAt),
    completedAt: toIsoOrNull(row.completedAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
