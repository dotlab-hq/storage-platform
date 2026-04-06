import {
  File,
  FileArchive,
  FileCode,
  FileImage,
  FileMusic,
  FileText,
  FileVideo,
  Folder,
  Loader2,
  Trash2,
  XCircle,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatBytes } from '@/lib/format-bytes'
import type { LucideIcon } from 'lucide-react'
import type { UploadingFile } from '@/components/storage/use-s3-bucket-viewer'

export type S3ViewerFileEntry = {
  key: string
  name: string
  sizeInBytes: number
  eTag: string | null
  lastModified: string | null
}

export type S3ViewerFolderEntry = {
  name: string
  prefix: string
}

function getFileIcon(fileName: string): LucideIcon {
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

function getFileIconColor(fileName: string): string {
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

function getIconBgColor(fileName: string): string {
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

function formatDate(dateString: string | null): string {
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

// Folder Card (grid view - keeping for backwards compatibility)
type FolderCardProps = {
  entry: S3ViewerFolderEntry
  onOpen: (prefix: string) => void
  onSelect: (prefix: string) => void
}

export function S3ViewerFolderCard({
  entry,
  onOpen,
  onSelect,
}: FolderCardProps) {
  return (
    <button
      type="button"
      className="rounded-2xl border bg-background/50 p-3 text-left hover:bg-muted/30"
      onDoubleClick={() => onOpen(entry.prefix)}
      onClick={() => onSelect(entry.prefix)}
    >
      <Folder className="mb-2 h-6 w-6 text-sky-500" />
      <p className="truncate text-sm font-semibold">{entry.name}</p>
    </button>
  )
}

// File Card (grid view - keeping for backwards compatibility)
type FileCardProps = {
  entry: S3ViewerFileEntry
  onOpen: (key: string) => void
  onDelete: (key: string) => void
}

export function S3ViewerFileCard({ entry, onOpen, onDelete }: FileCardProps) {
  return (
    <div className="rounded-2xl border bg-background/50 p-3">
      <button
        type="button"
        className="w-full text-left"
        onDoubleClick={() => onOpen(entry.key)}
      >
        <p className="truncate text-sm font-semibold">{entry.name}</p>
        <p className="text-muted-foreground truncate text-xs">
          {formatBytes(entry.sizeInBytes)}
        </p>
      </button>
      <div className="mt-2 flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onOpen(entry.key)}
        >
          Open
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={() => onDelete(entry.key)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Folder List Item (new list view)
type FolderListItemProps = {
  entry: S3ViewerFolderEntry
  onOpen: (prefix: string) => void
}

export function S3ViewerFolderListItem({ entry, onOpen }: FolderListItemProps) {
  return (
    <button
      type="button"
      onDoubleClick={() => onOpen(entry.prefix)}
      className="group flex items-center w-full px-4 py-3 hover:bg-muted/50 transition-colors text-left"
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mr-4">
        <Folder className="h-5 w-5 text-amber-500" />
      </div>

      {/* Name and item count */}
      <div className="flex-1 min-w-0 mr-4">
        <p className="text-sm font-medium text-foreground truncate">
          {entry.name}
        </p>
        <p className="text-xs text-muted-foreground">-</p>
      </div>

      {/* Size */}
      <div className="w-28 text-right">
        <span className="text-sm text-muted-foreground">-</span>
      </div>

      {/* Modified */}
      <div className="w-32 text-right">
        <span className="text-sm text-muted-foreground">-</span>
      </div>

      {/* Actions placeholder for alignment */}
      <div className="w-10" />
    </button>
  )
}

// File List Item (new list view)
type FileListItemProps = {
  entry: S3ViewerFileEntry
  onOpen: (key: string) => void
  onDelete: (key: string) => void
}

export function S3ViewerFileListItem({
  entry,
  onOpen,
  onDelete,
}: FileListItemProps) {
  const FileIcon = getFileIcon(entry.name)
  const iconColor = getFileIconColor(entry.name)
  const bgColor = getIconBgColor(entry.name)

  return (
    <div className="group flex items-center px-4 py-3 hover:bg-muted/50 transition-colors">
      {/* Icon */}
      <button
        title="none"
        type="button"
        onDoubleClick={() => onOpen(entry.key)}
        className={`flex-shrink-0 w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center mr-4`}
      >
        <FileIcon className={`h-5 w-5 ${iconColor}`} />
      </button>

      {/* Name */}
      <button
        type="button"
        onDoubleClick={() => onOpen(entry.key)}
        className="flex-1 min-w-0 mr-4 text-left"
      >
        <p className="text-sm font-medium text-foreground truncate">
          {entry.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatBytes(entry.sizeInBytes)}
        </p>
      </button>

      {/* Size */}
      <div className="w-28 text-right hidden sm:block">
        <span className="text-sm text-muted-foreground">
          {formatBytes(entry.sizeInBytes)}
        </span>
      </div>

      {/* Modified */}
      <div className="w-32 text-right hidden md:block">
        <span className="text-sm text-muted-foreground">
          {formatDate(entry.lastModified)}
        </span>
      </div>

      {/* Actions */}
      <div className="w-10 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(entry.key)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Uploading File List Item (shows optimistic upload progress)
type UploadingFileListItemProps = {
  file: UploadingFile
}

export function S3ViewerUploadingFileListItem({
  file,
}: UploadingFileListItemProps) {
  const bgColor = getIconBgColor(file.name)

  return (
    <div className="group flex items-center px-4 py-3 bg-muted/30 animate-pulse">
      {/* Icon */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center mr-4`}
      >
        {file.status === 'uploading' && (
          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
        )}
        {file.status === 'completed' && (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        )}
        {file.status === 'error' && (
          <XCircle className="h-5 w-5 text-destructive" />
        )}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0 mr-4">
        <p className="text-sm font-medium text-foreground truncate">
          {file.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {file.status === 'uploading' && `Uploading... ${file.progress}%`}
          {file.status === 'completed' && 'Upload complete'}
          {file.status === 'error' && (file.errorMessage || 'Upload failed')}
        </p>
      </div>

      {/* Size */}
      <div className="w-28 text-right hidden sm:block">
        <span className="text-sm text-muted-foreground">
          {formatBytes(file.sizeInBytes)}
        </span>
      </div>

      {/* Modified */}
      <div className="w-32 text-right hidden md:block">
        <span className="text-sm text-muted-foreground">-</span>
      </div>

      {/* Actions placeholder */}
      <div className="w-10" />
    </div>
  )
}
