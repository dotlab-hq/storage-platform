import { Button } from '@/components/ui/button'
import { formatBytes } from '@/lib/format-bytes'
import type { S3ViewerFolderEntry, S3ViewerFileEntry } from './s3-viewer-types'
import {
  getFileIcon,
  getFileIconColor,
  getIconBgColor,
} from './s3-viewer-icon-utils'
import { Folder, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

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
      onClick={() => {
        onSelect(entry.prefix)
        onOpen(entry.prefix)
      }}
    >
      <Folder className="mb-2 h-6 w-6 text-sky-500" />
      <p className="truncate text-sm font-semibold">{entry.name}</p>
    </button>
  )
}

type FileCardProps = {
  entry: S3ViewerFileEntry
  onOpen: (key: string) => void
  onDelete: (key: string) => void
}

export function S3ViewerFileCard({ entry, onOpen, onDelete }: FileCardProps) {
  const FileIcon = getFileIcon(entry.name)
  const iconColor = getFileIconColor(entry.name)
  const bgColor = getIconBgColor(entry.name)

  return (
    <div
      className="group relative cursor-pointer rounded-xl border bg-card p-3 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 hover:bg-accent/50"
      onDoubleClick={() => onOpen(entry.key)}
    >
      <div className="mb-3 flex items-start gap-3">
        <div
          className={cn(
            'flex-shrink-0 h-10 w-10 rounded-xl',
            bgColor,
            'flex items-center justify-center',
          )}
        >
          <FileIcon className={cn('h-5 w-5', iconColor)} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold" title={entry.name}>
            {entry.name}
          </p>
          <p className="text-muted-foreground text-xs">
            {formatBytes(entry.sizeInBytes)}
          </p>
        </div>
      </div>
      <div className="mt-2 flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            onOpen(entry.key)
          }}
        >
          Open
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(entry.key)
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
