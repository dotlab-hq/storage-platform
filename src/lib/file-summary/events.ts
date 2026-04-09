import type { StorageItem } from '@/types/storage'

export const FILE_SUMMARY_REQUEST_EVENT = 'dot:request-file-summary'

export type FileSummaryRequestDetail = {
  fileId: string
  fileName: string
  mimeType: string | null
  sizeInBytes: number
}

export function toSummaryRequestDetail(
  item: StorageItem,
): FileSummaryRequestDetail | null {
  if (item.type !== 'file') {
    return null
  }

  return {
    fileId: item.id,
    fileName: item.name,
    mimeType: item.mimeType,
    sizeInBytes: item.sizeInBytes,
  }
}
