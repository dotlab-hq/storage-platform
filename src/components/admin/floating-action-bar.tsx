import { useState } from 'react'
import { Ban, HardDrive, Shield, ShieldCheck, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog'
import { cn } from '@/lib/utils'
import { ByteLimitDialog } from './byte-limit-dialog'

/** Bulk actions; each resolves true on success (errors are already shown). */
type AdminFloatingActionBarProps = {
  selectedCount: number
  isPending: boolean
  onClear: () => void
  onBan: (banned: boolean) => Promise<boolean>
  onSetAdmin: (isAdmin: boolean) => Promise<boolean>
  onUpdateStorage: (bytes: number) => Promise<boolean>
  onUpdateFileSizeLimit: (bytes: number) => Promise<boolean>
  onDelete: () => Promise<boolean>
}

type OpenDialog = 'storage' | 'fileSize' | 'delete' | null

/**
 * Bottom bar shown while users are selected in the admin users table. It
 * takes the dock's place (the dock hides while the selection store is
 * non-empty).
 */
export function AdminFloatingActionBar({
  selectedCount,
  isPending,
  onClear,
  onBan,
  onSetAdmin,
  onUpdateStorage,
  onUpdateFileSizeLimit,
  onDelete,
}: AdminFloatingActionBarProps) {
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null)
  const closeDialog = () => setOpenDialog(null)
  const usersLabel = `${selectedCount} user${selectedCount === 1 ? '' : 's'}`

  if (selectedCount === 0 && openDialog === null) return null

  const confirmDelete = async () => {
    if (await onDelete()) closeDialog()
  }

  return (
    <>
      {selectedCount > 0 && (
        <div
          className={cn(
            'fixed bottom-6 left-1/2 z-40 -translate-x-1/2',
            'animate-in slide-in-from-bottom-4 fade-in duration-300',
          )}
        >
          <div className="bg-card flex items-center gap-2 rounded-xl border px-4 py-2 shadow-lg backdrop-blur-sm">
            <span className="text-foreground mr-2 text-sm font-medium">
              {usersLabel} selected
            </span>

            <div className="bg-border mx-1 h-6 w-px" />

            <Button
              size="sm"
              variant="ghost"
              onClick={() => void onBan(true)}
              disabled={isPending}
              className="text-destructive hover:text-destructive"
            >
              <Ban className="mr-1 h-4 w-4" />
              Ban
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void onBan(false)}
              disabled={isPending}
            >
              <Ban className="mr-1 h-4 w-4" />
              Unban
            </Button>

            <div className="bg-border mx-1 h-6 w-px" />

            <Button
              size="sm"
              variant="ghost"
              onClick={() => void onSetAdmin(true)}
              disabled={isPending}
            >
              <ShieldCheck className="mr-1 h-4 w-4" />
              Make Admin
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void onSetAdmin(false)}
              disabled={isPending}
            >
              <Shield className="mr-1 h-4 w-4" />
              Make User
            </Button>

            <div className="bg-border mx-1 h-6 w-px" />

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setOpenDialog('storage')}
              disabled={isPending}
            >
              <HardDrive className="mr-1 h-4 w-4" />
              Update Storage
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setOpenDialog('fileSize')}
              disabled={isPending}
            >
              <HardDrive className="mr-1 h-4 w-4" />
              Update File Size
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setOpenDialog('delete')}
              disabled={isPending}
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
              disabled={isPending}
              className="h-7 w-7"
              aria-label="Clear selection"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {openDialog === 'storage' && (
        <ByteLimitDialog
          title="Update Storage Limit"
          description={`Set the storage limit for ${usersLabel}.`}
          onSubmit={onUpdateStorage}
          onClose={closeDialog}
        />
      )}
      {openDialog === 'fileSize' && (
        <ByteLimitDialog
          title="Update File Size Limit"
          description={`Set the maximum file size for ${usersLabel}.`}
          onSubmit={onUpdateFileSizeLimit}
          onClose={closeDialog}
        />
      )}
      {openDialog === 'delete' && (
        <ConfirmActionDialog
          open
          onOpenChange={(open) => !open && !isPending && closeDialog()}
          title="Delete users"
          description={`Delete ${usersLabel} and all of their files? This cannot be undone.`}
          confirmLabel={isPending ? 'Deleting...' : 'Delete'}
          confirmVariant="destructive"
          isLoading={isPending}
          onConfirm={() => void confirmDelete()}
        />
      )}
    </>
  )
}
