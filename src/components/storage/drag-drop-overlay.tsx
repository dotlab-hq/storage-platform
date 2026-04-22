import { cn } from '@/lib/utils'
import { Upload } from 'lucide-react'

type DragDropOverlayProps = {
  isDragging: boolean
}

export function DragDropOverlay({ isDragging }: DragDropOverlayProps) {
  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-0 z-50 flex items-center justify-center transition-all duration-300',
        isDragging
          ? 'bg-background/60 opacity-100 backdrop-blur-sm'
          : 'opacity-0',
      )}
    >
      <div
        className={cn(
          'flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed p-12 transition-all duration-300',
          isDragging
            ? 'border-primary bg-primary/5 scale-100'
            : 'border-transparent scale-95',
        )}
      >
        <div
          className={cn(
            'bg-primary/10 text-primary rounded-full p-4 transition-transform duration-300',
            isDragging && 'animate-bounce',
          )}
        >
          <Upload className="h-8 w-8" />
        </div>
        <div className="text-center">
          <p className="text-foreground text-lg font-semibold">
            Drop to upload
          </p>
          <p className="text-muted-foreground text-sm">
            Release files to start uploading
          </p>
        </div>
      </div>
    </div>
  )
}
