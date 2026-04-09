export type FileSummaryJobStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'

export type FileSummarySourceType =
  | 'metadata-wave'
  | 'text-content'
  | 'media-metadata'
  | 'binary-metadata'

export type FileSummaryMetadata = {
  fileName: string
  extension: string | null
  mimeType: string | null
  sizeInBytes: number
  providerName: string | null
  bucketName: string | null
  waves: string[]
  bytesReadForSummary: number
  textWasTruncated: boolean
  modelInputChars: number
  maxInputChars: number
}

export type FileSummaryTarget = {
  fileId: string
  userId: string
  name: string
  mimeType: string | null
  sizeInBytes: number
  objectKey: string
  providerId: string | null
  providerName: string | null
  bucketName: string | null
  createdAt: Date
  updatedAt: Date
}

export type FileSummaryJobSnapshot = {
  id: string
  fileId: string
  userId: string
  model: string
  status: FileSummaryJobStatus
  sourceType: FileSummarySourceType
  isLargeFile: boolean
  attempts: number
  summaryText: string | null
  metadata: FileSummaryMetadata
  failureReason: string | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export type GeneratedSummary = {
  summaryText: string
  sourceType: FileSummarySourceType
  isLargeFile: boolean
  metadata: FileSummaryMetadata
}
