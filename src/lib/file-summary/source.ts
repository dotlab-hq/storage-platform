import { getFileExtension, isTextBasedFile } from '@/lib/file-type-utils'
import type { FileSummarySourceType, FileSummaryTarget } from './types'

export type FileSummarySourceProfile = {
  sourceType: FileSummarySourceType
  isLargeFile: boolean
  extension: string | null
  waves: string[]
}

function isMediaMimeType(mimeType: string | null): boolean {
  if (!mimeType) return false
  return (
    mimeType.startsWith('image/') ||
    mimeType.startsWith('video/') ||
    mimeType.startsWith('audio/')
  )
}

function buildWaveSet(
  sourceType: FileSummarySourceType,
  isLargeFile: boolean,
): string[] {
  if (isLargeFile) {
    return [
      'Wave 1: shape and size classification',
      'Wave 2: storage and provider fingerprint',
      'Wave 3: usage and lifecycle signal extraction',
    ]
  }

  if (sourceType === 'text-content') {
    return [
      'Wave 1: text excerpt ingestion',
      'Wave 2: intent and topic extraction',
      'Wave 3: concise end-user summary',
    ]
  }

  if (sourceType === 'media-metadata') {
    return [
      'Wave 1: media descriptor scan',
      'Wave 2: inferred usage context',
      'Wave 3: concise metadata summary',
    ]
  }

  return [
    'Wave 1: binary descriptor scan',
    'Wave 2: storage-context inference',
    'Wave 3: concise metadata summary',
  ]
}

export function createSourceProfile(
  target: FileSummaryTarget,
  largeFileBytes: number,
): FileSummarySourceProfile {
  const extension = getFileExtension(target.name)
  const isLargeFile = target.sizeInBytes >= largeFileBytes

  let sourceType: FileSummarySourceType
  if (isLargeFile) {
    sourceType = 'metadata-wave'
  } else if (isTextBasedFile(target.name, target.mimeType)) {
    sourceType = 'text-content'
  } else if (isMediaMimeType(target.mimeType)) {
    sourceType = 'media-metadata'
  } else {
    sourceType = 'binary-metadata'
  }

  return {
    sourceType,
    isLargeFile,
    extension,
    waves: buildWaveSet(sourceType, isLargeFile),
  }
}

export function shouldLoadTextExcerpt(
  target: FileSummaryTarget,
  source: FileSummarySourceProfile,
): boolean {
  if (source.isLargeFile) return false
  if (source.sourceType !== 'text-content') return false
  return isTextBasedFile(target.name, target.mimeType)
}
