import { Button } from '@/components/ui/button'
import { Folder, Loader2, Trash2, XCircle, CheckCircle2 } from 'lucide-react'
import { formatBytes } from '@/lib/format-bytes'
import {
  getFileIcon,
  getFileIconColor,
  getIconBgColor,
  formatDate,
} from './s3-viewer-icon-utils'
import type {
  S3ViewerFolderEntry,
  S3ViewerFileEntry,
  UploadingFile,
} from './s3-viewer-types'

type FolderListItemProps = {
  entry: S3ViewerFolderEntry
  onOpen: (prefix: string) => void
}

export function S3ViewerFolderListItem({ entry, onOpen }: FolderListItemProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(entry.prefix)}
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
