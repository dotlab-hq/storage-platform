import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { getFileIcon, getFolderIcon, formatFileSize } from '@/lib/file-utils'
import { cn } from '@/lib/utils'
import { RelativeTime } from '@/components/ui/relative-time'

type TrashItemData = {
  id: string
  name: string
  type: 'file' | 'folder'
  deletedAt: string | null
  sizeInBytes?: number
  mimeType?: string | null
}

/** Grid classes shared with the trash skeleton. */
export const TRASH_LIST_CLASS =
  'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'

type TrashContentProps<T extends TrashItemData> = {
  items: T[]
  selectedIds: ReadonlySet<string>
  onToggleSelect: (id: string) => void
  onRestore: (item: T) => void
  onDelete: (item: T) => void
  /** Double-clicking a trashed folder shows its contents. */
  onFolderOpen?: (item: T) => void
}

export function TrashContent<T extends TrashItemData>({
  items,
  selectedIds,
  onToggleSelect,
  onRestore,
  onDelete,
  onFolderOpen,
}: TrashContentProps<T>) {
  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
        <div className="bg-muted mb-4 rounded-full p-4">
          <Trash2 className="text-muted-foreground h-8 w-8" />
        </div>
        <h3 className="text-foreground mb-1 text-sm font-medium">
          Nothing here
        </h3>
        <p className="text-muted-foreground text-sm">
          Items you delete will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 pt-0">
      <div className={TRASH_LIST_CLASS}>
        {items.map((item) => {
          const Icon =
            item.type === 'folder'
              ? getFolderIcon()
              : getFileIcon(item.name, item.mimeType ?? null)
          const isSelected = selectedIds.has(item.id)

          return (
            <div
              key={item.id}
              className={cn(
                'group relative rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50',
                isSelected && 'border-primary ring-1 ring-primary',
                item.type === 'folder' && 'cursor-pointer',
              )}
              onDoubleClick={() => {
                if (item.type === 'folder') onFolderOpen?.(item)
              }}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelect(item.id)}
                  className="mt-1"
                  aria-label={`Select ${item.name}`}
                />
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" title={item.name}>
                    {item.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Deleted{' '}
                    {item.deletedAt ? (
                      <RelativeTime date={item.deletedAt} />
                    ) : (
                      'at an unknown time'
                    )}
                    {item.type === 'file' && item.sizeInBytes != null && (
                      <> &middot; {formatFileSize(item.sizeInBytes)}</>
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRestore(item)}
                >
                  <RotateCcw className="mr-1 h-3 w-3" />
                  Restore
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(item)}
                >
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
