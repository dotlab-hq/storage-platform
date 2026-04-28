'use client'

import { useState } from 'react'
import {
  MoreHorizontal,
  Eye,
  UserCog,
  Ban,
  Shield,
  Trash2,
  HardDrive,
  ShieldOff,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from '@/components/ui/sonner'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { AdminUser } from '@/lib/storage-provider-queries'
import { impersonateUserFn } from '@/routes/_app/admin/-components/-admin-server'

type UserRowActionsDropdownProps = {
  user: AdminUser
  onViewFiles?: () => void
  onRoleChange?: (isAdmin: boolean) => Promise<void>
  onBan?: (banned: boolean) => Promise<void>
  onDelete?: () => Promise<void>
  onUpdateStorage?: (storageLimitBytes: number) => Promise<void>
}

export function UserRowActionsDropdown({
  user,
  onViewFiles,
  onRoleChange,
  onBan,
  onDelete,
  onUpdateStorage,
}: UserRowActionsDropdownProps) {
  const [showStorageDialog, setShowStorageDialog] = useState(false)
  const [storageInput, setStorageInput] = useState(
    String(user.storageLimitBytes),
  )
  const [isUpdating, setIsUpdating] = useState(false)

  const handleImpersonate = async () => {
    setIsUpdating(true)
    try {
      await impersonateUserFn({ data: { userId: user.id } })
      window.location.href = '/'
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to impersonate user'
      toast.error(message)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStorageUpdate = async () => {
    const bytes = Number(storageInput)
    if (!Number.isFinite(bytes) || bytes <= 0) {
      toast.error('Please enter a valid storage limit')
      return
    }
    if (!onUpdateStorage) return
    setIsUpdating(true)
    try {
      await onUpdateStorage(bytes)
      toast.success('Storage limit updated')
      setShowStorageDialog(false)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update storage'
      toast.error(message)
    } finally {
      setIsUpdating(false)
    }
  }

  const toggleBan = async (banned: boolean) => {
    if (!onBan) return
    setIsUpdating(true)
    try {
      await onBan(banned)
      toast.success(banned ? 'User banned' : 'User unbanned')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update ban status'
      toast.error(message)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    const confirmed = window.confirm(
      `Are you sure you want to delete user "${user.name}"? This cannot be undone.`,
    )
    if (!confirmed) return
    setIsUpdating(true)
    try {
      await onDelete()
      toast.success('User deleted')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete user'
      toast.error(message)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRoleChange = async (isAdmin: boolean) => {
    if (!onRoleChange) return
    setIsUpdating(true)
    try {
      await onRoleChange(isAdmin)
      toast.success('User role updated')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update role'
      toast.error(message)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          side="bottom"
          avoidCollisions
          className="w-48"
        >
          <DropdownMenuItem onClick={onViewFiles}>
            <Eye className="mr-2 h-4 w-4" />
            View Files
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleRoleChange(!user.isAdmin)}>
            <UserCog className="mr-2 h-4 w-4" />
            {user.isAdmin ? 'Make User' : 'Make Admin'}
          </DropdownMenuItem>
          {user.banned ? (
            <DropdownMenuItem onClick={() => toggleBan(false)}>
              <ShieldOff className="mr-2 h-4 w-4" />
              Unban
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => toggleBan(true)}
              className="text-destructive focus:text-destructive"
            >
              <Ban className="mr-2 h-4 w-4" />
              Ban
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setShowStorageDialog(true)}>
            <HardDrive className="mr-2 h-4 w-4" />
            Storage Limit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleImpersonate}>
            <Shield className="mr-2 h-4 w-4" />
            Impersonate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Storage Limit Dialog */}
      <Dialog open={showStorageDialog} onOpenChange={setShowStorageDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Storage Limit</DialogTitle>
            <DialogDescription>
              Set a new storage allocation for {user.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="number"
              placeholder={`Current: ${user.storageLimitBytes} bytes`}
              value={storageInput}
              onChange={(e) => setStorageInput(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowStorageDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleStorageUpdate} disabled={isUpdating}>
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Update'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
