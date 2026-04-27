import {
  File,
  FileArchive,
  FileCode,
  FileImage,
  FileMusic,
  FileText,
  FileVideo,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export function getFileIcon(fileName: string): LucideIcon {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''

  const iconMap: Record<string, LucideIcon> = {
    jpg: FileImage,
    jpeg: FileImage,
    png: FileImage,
    gif: FileImage,
    webp: FileImage,
    svg: FileImage,
    mp4: FileVideo,
    mov: FileVideo,
    webm: FileVideo,
    mp3: FileMusic,
    wav: FileMusic,
    ogg: FileMusic,
    pdf: FileText,
    doc: FileText,
    docx: FileText,
    txt: FileText,
    md: FileText,
    zip: FileArchive,
    rar: FileArchive,
    '7z': FileArchive,
    tar: FileArchive,
    gz: FileArchive,
    js: FileCode,
    ts: FileCode,
    jsx: FileCode,
    tsx: FileCode,
    py: FileCode,
    java: FileCode,
    cpp: FileCode,
    c: FileCode,
    html: FileCode,
    css: FileCode,
    json: FileCode,
  }

  return iconMap[ext] ?? File
}

export function getFileIconColor(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''

  const colorMap: Record<string, string> = {
    jpg: 'text-purple-500',
    jpeg: 'text-purple-500',
    png: 'text-purple-500',
    gif: 'text-purple-500',
    svg: 'text-purple-500',
    mp4: 'text-red-500',
    mov: 'text-red-500',
    webm: 'text-red-500',
    mp3: 'text-pink-500',
    pdf: 'text-blue-500',
    doc: 'text-blue-500',
    docx: 'text-blue-500',
    zip: 'text-amber-500',
    rar: 'text-amber-500',
    js: 'text-yellow-500',
    ts: 'text-blue-400',
    html: 'text-orange-500',
    css: 'text-sky-500',
  }

  return colorMap[ext] ?? 'text-slate-500'
}

export function getIconBgColor(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''

  const bgMap: Record<string, string> = {
    jpg: 'bg-purple-50',
    jpeg: 'bg-purple-50',
    png: 'bg-purple-50',
    gif: 'bg-purple-50',
    svg: 'bg-purple-50',
    mp4: 'bg-red-50',
    mov: 'bg-red-50',
    webm: 'bg-red-50',
    mp3: 'bg-pink-50',
    pdf: 'bg-blue-50',
    doc: 'bg-blue-50',
    docx: 'bg-blue-50',
    zip: 'bg-amber-50',
    rar: 'bg-amber-50',
    js: 'bg-yellow-50',
    ts: 'bg-blue-50',
    html: 'bg-orange-50',
    css: 'bg-sky-50',
  }

  return bgMap[ext] ?? 'bg-slate-50'
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return '-'

  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}
