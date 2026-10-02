import { useState } from 'react'
import {
  Ban,
  Eye,
  HardDrive,
  MoreHorizontal,
  Shield,
  ShieldOff,
  Trash2,
  UserCog,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog'
import { toast } from '@/components/ui/sonner'
import type { AdminUser } from '@/lib/storage-provider-queries'
import { impersonateUserFn } from '@/routes/_app/admin/-components/-admin-impersonation-fns'
import { ByteLimitDialog } from './byte-limit-dialog'
import type { UserActions } from './users-table-columns'

type OpenDialog = 'storage' | 'fileSize' | 'delete' | null

/** The "..." menu on a user row: role, ban, limits, impersonate, delete. */
export function UserRowActionsDropdown({
  user,
  actions,
}: {
  user: AdminUser
  actions: UserActions
}) {
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const closeDialog = () => setOpenDialog(null)

  const impersonate = async () => {
    try {
      await impersonateUserFn({ data: { userId: user.id } })
      // The session now belongs to another user: a full page load drops every
      // cached query and store of the admin (same as signing out).
      window.location.assign('/')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to impersonate user',
      )
    }
  }

  const confirmDelete = async () => {
    setIsDeleting(true)
    const deleted = await actions.onDelete(user.id)
    setIsDeleting(false)
    if (deleted) closeDialog()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label={`Actions for ${user.name}`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom" className="w-48">
          <DropdownMenuItem onClick={() => actions.onViewFiles(user)}>
            <Eye className="mr-2 h-4 w-4" />
            View Files
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => void actions.onRoleChange(user.id, !user.isAdmin)}
          >
            <UserCog className="mr-2 h-4 w-4" />
            {user.isAdmin ? 'Make User' : 'Make Admin'}
          </DropdownMenuItem>
          {user.banned ? (
            <DropdownMenuItem
              onClick={() => void actions.onBan(user.id, false)}
            >
              <ShieldOff className="mr-2 h-4 w-4" />
              Unban
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => void actions.onBan(user.id, true)}
              className="text-destructive focus:text-destructive"
            >
              <Ban className="mr-2 h-4 w-4" />
              Ban
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setOpenDialog('storage')}>
            <HardDrive className="mr-2 h-4 w-4" />
            Storage Limit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDialog('fileSize')}>
            <HardDrive className="mr-2 h-4 w-4" />
            File Size Limit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => void impersonate()}>
            <Shield className="mr-2 h-4 w-4" />
            Impersonate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setOpenDialog('delete')}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {openDialog === 'storage' && (
        <ByteLimitDialog
          title="Update Storage Limit"
          description={`Set a new storage allocation for ${user.name}.`}
          initialBytes={user.storageLimitBytes}
          onSubmit={(bytes) => actions.onUpdateStorage(user.id, bytes)}
          onClose={closeDialog}
        />
      )}
      {openDialog === 'fileSize' && (
        <ByteLimitDialog
          title="Update File Size Limit"
          description={`Set a new maximum file size for ${user.name}.`}
          initialBytes={user.fileSizeLimitBytes}
          onSubmit={(bytes) => actions.onUpdateFileSizeLimit(user.id, bytes)}
          onClose={closeDialog}
        />
      )}
      {openDialog === 'delete' && (
        <ConfirmActionDialog
          open
          onOpenChange={(open) => !open && !isDeleting && closeDialog()}
          title="Delete user"
          description={`Delete "${user.name}" and all of their files? This cannot be undone.`}
          confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
          confirmVariant="destructive"
          isLoading={isDeleting}
          onConfirm={() => void confirmDelete()}
        />
      )}
    </>
  )
}
