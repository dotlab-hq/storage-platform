import {
  ArrowRightLeft,
  Pencil,
  Route,
  Share2,
  ShieldCheck,
  Trash2,
  Download,
  ExternalLink,
  RotateCcw,
  AlertTriangle,
  Link,
} from 'lucide-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import type { ContextMenuAction, StorageItem } from '@/types/storage'

type FileContextMenuProps = {
  children: React.ReactNode
  item: StorageItem
  isTrash?: boolean
  isReadOnly?: boolean
  onAction: (action: ContextMenuAction, item: StorageItem) => void
}

export function FileContextMenu({
  children,
  item,
  isTrash = false,
  isReadOnly = false,
  onAction,
}: FileContextMenuProps) {
  const trigger = (
    <div onContextMenuCapture={(event) => event.stopPropagation()}>
      {children}
    </div>
  )

  if (isTrash) {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>{trigger}</ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem
            onSelect={() => onAction('restore', item)}
            disabled={isReadOnly}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restore
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => onAction('delete-permanent', item)}
            disabled={isReadOnly}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Delete permanently
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{trigger}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onSelect={() => onAction('open', item)}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Open
        </ContextMenuItem>
        {item.type === 'file' && (
          <ContextMenuItem onSelect={() => onAction('download', item)}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem
          onSelect={() => onAction('rename', item)}
          disabled={isReadOnly}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Rename
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => onAction('move', item)}
          disabled={isReadOnly}
        >
          <ArrowRightLeft className="mr-2 h-4 w-4" />
          Move
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => onAction('update-path', item)}
          disabled={isReadOnly}
        >
          <Route className="mr-2 h-4 w-4" />
          Update Path & Move
        </ContextMenuItem>
        {item.type === 'file' && (
          <ContextMenuItem
            onSelect={() => onAction('share', item)}
            disabled={isReadOnly}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </ContextMenuItem>
        )}
        {item.type === 'folder' && (
          <ContextMenuItem
            onSelect={() => onAction('private-lock', item)}
            disabled={isReadOnly}
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            {item.isPrivatelyLocked
              ? 'Remove private lock'
              : 'Mark private lock'}
          </ContextMenuItem>
        )}
        <ContextMenuItem onSelect={() => onAction('copy-link', item)}>
          <Link className="mr-2 h-4 w-4" />
          Copy Link
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={() => onAction('delete', item)}
          disabled={isReadOnly}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
