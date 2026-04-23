import { Trash2, RotateCcw, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { getFileIcon, getFolderIcon, formatFileSize } from '@/lib/file-utils'
import { cn } from '@/lib/utils'

type TrashItemData = {
  id: string
  name: string
  type: 'file' | 'folder'
  deletedAt: string | null
  sizeInBytes?: number
  mimeType?: string | null
}

type TrashContentProps = {
  items: TrashItemData[]
  isLoading: boolean
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onRestore: (id: string, type: 'file' | 'folder') => void
  onDelete: (id: string, type: 'file' | 'folder') => void
}

export function TrashContent({
  items,
  isLoading,
  selectedIds,
  onToggleSelect,
  onRestore,
  onDelete,
}: TrashContentProps) {
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
        <div className="bg-muted mb-4 rounded-full p-4">
          <Trash2 className="text-muted-foreground h-8 w-8" />
        </div>
        <h3 className="text-foreground mb-1 text-sm font-medium">
          Trash is empty
        </h3>
        <p className="text-muted-foreground text-sm">
          Items you delete will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 pt-0">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const Icon =
            item.type === 'folder'
              ? getFolderIcon()
              : getFileIcon(item.name, item.mimeType ?? null)
          const deletedLabel = item.deletedAt
            ? formatTimeSince(item.deletedAt)
            : 'Unknown'
          const isSelected = selectedIds.has(item.id)

          return (
            <div
              key={item.id}
              className={cn(
                'group relative rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50',
                isSelected && 'border-primary ring-1 ring-primary',
              )}
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
                    Deleted {deletedLabel}
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
                  onClick={() => onRestore(item.id, item.type)}
                >
                  <RotateCcw className="mr-1 h-3 w-3" />
                  Restore
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(item.id, item.type)}
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

function formatTimeSince(isoDate: string): string {
  const ms = Date.now() - new Date(isoDate).getTime()
  const minutes = Math.floor(ms / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}
