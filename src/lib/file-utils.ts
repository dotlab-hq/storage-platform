import {
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  FileArchive,
  FileSpreadsheet,
  Folder,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getFileExtension } from '@/lib/file-type-utils'

const EXTENSION_ICON_MAP: Record<string, LucideIcon> = {
  txt: FileText,
  text: FileText,
  md: FileText,
  mdx: FileText,
  rtf: FileText,
  html: FileCode,
  htm: FileCode,
  css: FileCode,
  scss: FileCode,
  sass: FileCode,
  less: FileCode,
  js: FileCode,
  jsx: FileCode,
  ts: FileCode,
  tsx: FileCode,
  mjs: FileCode,
  cjs: FileCode,
  json: FileCode,
  jsonc: FileCode,
  yaml: FileCode,
  yml: FileCode,
  xml: FileCode,
  svg: FileImage,
  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
  gif: FileImage,
  webp: FileImage,
  mp4: FileVideo,
  webm: FileVideo,
  mov: FileVideo,
  mp3: FileAudio,
  wav: FileAudio,
  ogg: FileAudio,
  zip: FileArchive,
  gz: FileArchive,
  rar: FileArchive,
  tar: FileArchive,
  csv: FileSpreadsheet,
  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,
}

const MIME_ICON_MAP: Record<string, LucideIcon> = {
  'image/': FileImage,
  'video/': FileVideo,
  'audio/': FileAudio,
  'text/': FileText,
  'application/pdf': FileText,
  'application/json': FileCode,
  'application/javascript': FileCode,
  'application/typescript': FileCode,
  'application/xml': FileCode,
  'application/zip': FileArchive,
  'application/gzip': FileArchive,
  'application/x-rar': FileArchive,
  'application/x-tar': FileArchive,
  'application/vnd.ms-excel': FileSpreadsheet,
  'application/vnd.openxmlformats-officedocument.spreadsheetml':
    FileSpreadsheet,
  'text/csv': FileSpreadsheet,
}

export function getFileIcon(
  fileName: string,
  mimeType: string | null,
): LucideIcon {
  const extension = getFileExtension(fileName)
  if (extension && EXTENSION_ICON_MAP[extension]) {
    return EXTENSION_ICON_MAP[extension]
  }

  if (!mimeType) return File

  for (const [prefix, icon] of Object.entries(MIME_ICON_MAP)) {
    if (mimeType.startsWith(prefix)) return icon
  }
  return File
}

export function getFolderIcon(): LucideIcon {
  return Folder
}

export function formatFileSize(bytes: number | null | undefined): string {
  const safeBytes =
    Number.isFinite(bytes) && typeof bytes === 'number' ? Math.max(0, bytes) : 0
  if (safeBytes === 0) return '0 bytes'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(safeBytes) / Math.log(1024))
  const size = safeBytes / Math.pow(1024, i)
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export async function downloadFromUrl(
  url: string,
  filename: string,
): Promise<void> {
  const response = await fetch(url)
  if (!response.ok)
    throw new Error(
      `Failed to download: HTTP ${response.status} ${response.statusText}`,
    )
  const blob = await response.blob()
  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(blobUrl)
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString()
}
