import { useState } from 'react'
import { Ban, Trash2, X, HardDrive, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/sonner'

type AdminFloatingActionBarProps = {
  selectedCount: number
  onClear: () => void
  onBan: (banned: boolean) => Promise<void>
  onDelete: () => Promise<void>
  onUpdateStorage: (storageLimitBytes: number) => Promise<void>
  isLoading?: boolean
}

export function AdminFloatingActionBar({
  selectedCount,
  onClear,
  onBan,
  onDelete,
  onUpdateStorage,
  isLoading,
}: AdminFloatingActionBarProps) {
  const [showStorageModal, setShowStorageModal] = useState(false)
  const [storageInput, setStorageInput] = React.useState('')

  if (selectedCount === 0) return null

  const handleStorageSubmit = async () => {
    const bytes = Number(storageInput)
    if (!Number.isFinite(bytes) || bytes <= 0) {
      toast.error('Please enter a valid storage limit')
      return
    }
    await onUpdateStorage(bytes)
    setShowStorageModal(false)
    setStorageInput('')
  }

  return (
    <>
      <div
        className={cn(
          'fixed bottom-6 left-1/2 z-40 -translate-x-1/2',
          'animate-in slide-in-from-bottom-4 fade-in duration-300',
        )}
      >
        <div className="bg-card flex items-center gap-2 rounded-xl border px-4 py-2 shadow-lg backdrop-blur-sm">
          <span className="text-foreground mr-2 text-sm font-medium">
            {selectedCount} user{selectedCount > 1 ? 's' : ''} selected
          </span>

          <div className="bg-border mx-1 h-6 w-px" />

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onBan(true)}
            disabled={isLoading}
            className="text-destructive hover:text-destructive"
          >
            <Ban className="mr-1 h-4 w-4" />
            Ban
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onBan(false)}
            disabled={isLoading}
          >
            <Ban className="mr-1 h-4 w-4" />
            Unban
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowStorageModal(true)}
            disabled={isLoading}
          >
            <HardDrive className="mr-1 h-4 w-4" />
            Update Storage
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete()}
            disabled={isLoading}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Delete
          </Button>

          <div className="bg-border mx-1 h-6 w-px" />

          <Button
            size="icon"
            variant="ghost"
            onClick={onClear}
            disabled={isLoading}
            className="h-7 w-7"
            aria-label="Clear selection"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showStorageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold">Update Storage Limit</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Set the storage limit for the selected user(s).
            </p>
            <Input
              type="number"
              placeholder="Enter storage limit in bytes"
              value={storageInput}
              onChange={(e) => setStorageInput(e.target.value)}
              className="mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowStorageModal(false)
                  setStorageInput('')
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleStorageSubmit} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Update'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
