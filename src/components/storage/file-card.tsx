import { useCallback } from 'react'
import {
  MoreHorizontal,
  Pencil,
  Share2,
  Check,
  ShieldCheck,
  Trash2,
  Download,
  ExternalLink,
  Link,
  Route,
  ArrowRightLeft,
  Upload,
  FolderUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getFileIcon,
  getFolderIcon,
  formatFileSize,
  formatRelativeTime,
} from '@/lib/file-utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InlineRename } from './inline-rename'
import type { StorageItem, ContextMenuAction } from '@/types/storage'

type FileCardProps = {
  item: StorageItem
  isSelected: boolean
  onDoubleClick: (item: StorageItem) => void
  onContextAction: (action: ContextMenuAction, item: StorageItem) => void
  isRenaming?: boolean
  onRename?: (item: StorageItem, newName: string) => void
  onRenameCancel?: () => void
  onDropOnFolder?: (
    draggedId: string,
    draggedType: 'file' | 'folder',
    targetFolderId: string,
  ) => void
  isReadOnly?: boolean
  onUploadFiles?: () => void
  onUploadFolder?: () => void
}

export function FileCard({
  item,
  isSelected,
  onDoubleClick,
  onContextAction,
  isRenaming = false,
  onRename,
  onRenameCancel,
  onDropOnFolder,
  isReadOnly = false,
  onUploadFiles,
  onUploadFolder,
}: FileCardProps) {
  const isFolder = item.type === 'folder'
  const Icon = isFolder
    ? getFolderIcon()
    : getFileIcon(item.name, item.mimeType)

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.setData('application/storage-item-id', item.id)
      e.dataTransfer.setData('application/storage-item-type', item.type)
      e.dataTransfer.effectAllowed = 'move'
    },
    [item.id, item.type],
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!isFolder) return
      if (e.dataTransfer.types.includes('application/storage-item-id')) {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
      }
    },
    [isFolder],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (!isFolder) return
      e.preventDefault()
      e.stopPropagation()
      const draggedId = e.dataTransfer.getData('application/storage-item-id')
      const draggedType = e.dataTransfer.getData(
        'application/storage-item-type',
      ) as 'file' | 'folder'
      if (draggedId && draggedId !== item.id) {
        onDropOnFolder?.(draggedId, draggedType, item.id)
      }
    },
    [isFolder, item.id, onDropOnFolder],
  )

  return (
    <div
      className={cn(
        'file-card group relative cursor-pointer rounded-xl p-4 transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5 hover:bg-accent/50',
        isSelected && 'ring-primary/50 bg-primary/5 ring-2 shadow',
        !isSelected && 'bg-card shadow-sm',
      )}
      data-file-card="true"
      data-storage-item-id={item.id}
      draggable={!isRenaming && !isReadOnly}
      onDoubleClick={() => onDoubleClick(item)}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onContextAction('select', item)}>
              <Check className="mr-2 h-4 w-4" />{' '}
              {isSelected ? 'Selected' : 'Select'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onContextAction('open', item)}>
              <ExternalLink className="mr-2 h-4 w-4" /> Open
            </DropdownMenuItem>
            {item.type === 'file' && (
              <DropdownMenuItem
                onClick={() => onContextAction('download', item)}
              >
                <Download className="mr-2 h-4 w-4" /> Download
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onContextAction('rename', item)}
              disabled={isReadOnly}
            >
              <Pencil className="mr-2 h-4 w-4" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onContextAction('move', item)}
              disabled={isReadOnly}
            >
              <ArrowRightLeft className="mr-2 h-4 w-4" /> Move
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onContextAction('update-path', item)}
              disabled={isReadOnly}
            >
              <Route className="mr-2 h-4 w-4" /> Update Path & Move
            </DropdownMenuItem>
            {item.type === 'file' && (
              <DropdownMenuItem
                onClick={() => onContextAction('share', item)}
                disabled={isReadOnly}
              >
                <Share2 className="mr-2 h-4 w-4" /> Share
              </DropdownMenuItem>
            )}
            {item.type === 'folder' && (
              <DropdownMenuItem
                onClick={() => onContextAction('private-lock', item)}
                disabled={isReadOnly}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                {item.isPrivatelyLocked
                  ? 'Remove private lock'
                  : 'Mark private lock'}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onContextAction('copy-link', item)}
            >
              <Link className="mr-2 h-4 w-4" /> Copy Link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {item.type === 'folder' && onUploadFiles && (
              <DropdownMenuItem onClick={onUploadFiles} disabled={isReadOnly}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Files Here
              </DropdownMenuItem>
            )}
            {item.type === 'folder' && onUploadFolder && (
              <DropdownMenuItem onClick={onUploadFolder} disabled={isReadOnly}>
                <FolderUp className="mr-2 h-4 w-4" />
                Upload Folder Here
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onContextAction('delete', item)}
              disabled={isReadOnly}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Trash
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        className={cn(
          'mb-3 flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
          isFolder
            ? 'bg-primary/10 text-primary'
            : 'bg-muted text-muted-foreground',
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="mb-1 truncate text-sm font-medium" title={item.name}>
        <InlineRename
          name={item.name}
          isRenaming={isRenaming}
          onRename={(newName) => onRename?.(item, newName)}
          onCancel={() => onRenameCancel?.()}
        />
      </div>

      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        {item.type === 'file' && (
          <span>{formatFileSize(item.sizeInBytes)}</span>
        )}
        <span>{formatRelativeTime(item.createdAt)}</span>
      </div>

      {item.type === 'file' && item.isShared && (
        <Badge variant="secondary" className="mt-2 text-[10px]">
          Shared
        </Badge>
      )}
      {item.isPrivatelyLocked && (
        <Badge className="mt-2 bg-green-600 text-white hover:bg-green-600 text-[10px]">
          Private lock
        </Badge>
      )}
    </div>
  )
}
