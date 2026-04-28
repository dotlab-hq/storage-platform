import { Trash2, Share2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type FloatingActionBarProps = {
  selectedCount: number
  onDelete: () => void
  onShare: () => void
  onClear: () => void
}

export function FloatingActionBar({
  selectedCount,
  onDelete,
  onShare,
  onClear,
}: FloatingActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 z-40 -translate-x-1/2',
        'animate-in slide-in-from-bottom-4 fade-in duration-300',
      )}
    >
      <div className="bg-card flex items-center gap-2 rounded-xl border px-4 py-2 shadow-lg backdrop-blur-sm">
        <span className="text-foreground mr-2 text-sm font-medium">
          {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
        </span>

        <div className="bg-border mx-1 h-6 w-px" />

        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="mr-1 h-4 w-4" />
          Trash
        </Button>
        <Button size="sm" variant="ghost" onClick={onShare}>
          <Share2 className="mr-1 h-4 w-4" />
          Share
        </Button>

        <div className="bg-border mx-1 h-6 w-px" />

        <Button
          size="icon"
          variant="ghost"
          onClick={onClear}
          className="h-7 w-7"
          aria-label="Clear selection"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
