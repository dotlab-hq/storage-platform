'use client'

import { Button } from '@/components/ui/button'
import { RotateCcw, AlertTriangle } from 'lucide-react'

type BulkActionBarProps = {
  selectedCount: number
  onBulkRestore: () => void
  onBulkDelete: () => void
  onCancel: () => void
}

export function BulkActionBar({
  selectedCount,
  onBulkRestore,
  onBulkDelete,
  onCancel,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="mx-4 mt-4 flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-2">
      <span className="text-sm font-medium">
        {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
      </span>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onBulkRestore}>
          <RotateCcw className="mr-1 h-3 w-3" />
          Restore
        </Button>
        <Button size="sm" variant="destructive" onClick={onBulkDelete}>
          <AlertTriangle className="mr-1 h-3 w-3" />
          Delete
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
