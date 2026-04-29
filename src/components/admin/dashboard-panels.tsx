'use client'

import { useState, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Play } from 'lucide-react'
import { toast } from '@/components/ui/sonner'
import { DEFAULT_PROVIDER_ID } from '@/lib/storage-provider-constants'
import type { AdminProvider, AdminUser } from '@/lib/storage-provider-queries'
import { formatBytes } from '@/lib/format-bytes'
import { UsersTable } from './users-table'
import { AdminFloatingActionBar } from './floating-action-bar'
import { useAdminUsersMutations } from '@/hooks/use-admin-users.mutations'

type MetricCardProps = { title: string; value: string | number }

export function MetricCard({ title, value }: MetricCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4 backdrop-blur-sm transition-all duration-300 hover:from-primary/15 hover:via-background hover:to-secondary/15">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        <p className="text-3xl font-bold tracking-tight text-foreground">
          {value}
        </p>
      </div>
    </div>
  )
}

export function ProvidersPanel({
  providers,
  onToggleAvailability,
  onDelete,
  onEdit,
  onViewContents,
  onTriggerCron,
  isCronTriggering,
}: {
  providers: AdminProvider[]
  onToggleAvailability: (providerId: string, isActive: boolean) => Promise<void>
  onDelete: (providerId: string) => Promise<void>
  onEdit: (provider: AdminProvider) => void
  onViewContents: (provider: AdminProvider) => void
  onTriggerCron: () => Promise<void>
  isCronTriggering: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Storage Providers
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage your storage providers and their configurations
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onTriggerCron}
            disabled={isCronTriggering}
          >
            <Play className="mr-2 h-4 w-4" />
            {isCronTriggering ? 'Triggering...' : 'Trigger Trash Deletion'}
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="group relative overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-blue-50/40 via-background to-cyan-50/40 p-4 transition-all duration-300 hover:border-border/80 hover:from-blue-50/60 hover:via-background hover:to-cyan-50/60 dark:from-blue-950/20 dark:to-cyan-950/20 dark:hover:from-blue-950/40 dark:hover:to-cyan-950/40"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-foreground">{provider.name}</p>
                <p className="text-xs text-muted-foreground">
                  Storage: {formatBytes(provider.usedStorageBytes)} /{' '}
                  {formatBytes(provider.storageLimitBytes)} • Max file size:{' '}
                  {formatBytes(provider.fileSizeLimitBytes)}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Badge variant={provider.isActive ? 'default' : 'secondary'}>
                  {provider.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={provider.id.startsWith('optimistic-')}
                    title={
                      provider.id.startsWith('optimistic-')
                        ? 'Provider is still being created'
                        : 'View contents'
                    }
                    onClick={() => {
                      onViewContents(provider)
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {provider.id !== DEFAULT_PROVIDER_ID ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onEdit(provider)
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          void onToggleAvailability(
                            provider.id,
                            !provider.isActive,
                          )
                        }}
                      >
                        {provider.isActive
                          ? 'Mark Unavailable'
                          : 'Mark Available'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                        onClick={() => {
                          void onDelete(provider.id)
                        }}
                      >
                        Delete
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function UsersPanel({
  users,
  onUserUpdate,
  onViewUserFiles,
}: {
  users: AdminUser[]
  onUserUpdate?: () => void
  onViewUserFiles?: (user: AdminUser) => void
}) {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const {
    updateRoleMutation,
    banUsersMutation,
    deleteUsersMutation,
    updateStorageLimitMutation,
  } = useAdminUsersMutations()

  const clearSelection = useCallback(() => {
    setSelectedUserIds([])
  }, [])

  // Individual user actions
  const handleRoleChange = useCallback(
    async (userId: string, isAdmin: boolean) => {
      try {
        await updateRoleMutation.mutateAsync({ userId, isAdmin })
        onUserUpdate?.()
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to update user role'
        toast.error(message)
      }
    },
    [updateRoleMutation, onUserUpdate],
  )

  const handleBanUser = useCallback(
    async (userId: string, banned: boolean) => {
      try {
        await banUsersMutation.mutateAsync({ userIds: [userId], banned })
        onUserUpdate?.()
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to update ban status'
        toast.error(message)
      }
    },
    [banUsersMutation, onUserUpdate],
  )

  const handleDeleteUser = useCallback(
    async (userId: string) => {
      const confirmed = window.confirm(
        `Are you sure you want to delete this user? This cannot be undone.`,
      )
      if (!confirmed) {
        return
      }
      try {
        await deleteUsersMutation.mutateAsync({ userIds: [userId] })
        onUserUpdate?.()
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to delete user'
        toast.error(message)
      }
    },
    [deleteUsersMutation, onUserUpdate],
  )

  const handleUpdateStorageUser = useCallback(
    async (userId: string, storageLimitBytes: number) => {
      try {
        await updateStorageLimitMutation.mutateAsync({
          userId,
          storageLimitBytes,
        })
        onUserUpdate?.()
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to update storage'
        toast.error(message)
      }
    },
    [updateStorageLimitMutation, onUserUpdate],
  )

  // Bulk actions (for floating action bar)
  const handleBan = useCallback(
    async (banned: boolean) => {
      if (selectedUserIds.length === 0) return

      setIsLoading(true)
      try {
        await banUsersMutation.mutateAsync({ userIds: selectedUserIds, banned })
        toast.success(banned ? 'User(s) banned' : 'User(s) unbanned')
        clearSelection()
        onUserUpdate?.()
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : `Failed to ${banned ? 'ban' : 'unban'} user(s)`
        toast.error(message)
      } finally {
        setIsLoading(false)
      }
    },
    [selectedUserIds, banUsersMutation, clearSelection, onUserUpdate],
  )

  const handleDelete = useCallback(async () => {
    if (selectedUserIds.length === 0) return

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedUserIds.length} user(s)? This action cannot be undone.`,
    )
    if (!confirmed) return

    setIsLoading(true)
    try {
      await deleteUsersMutation.mutateAsync({ userIds: selectedUserIds })
      toast.success('User(s) deleted')
      clearSelection()
      onUserUpdate?.()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete user(s)'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [selectedUserIds, deleteUsersMutation, clearSelection, onUserUpdate])

  const handleUpdateStorage = useCallback(
    async (storageLimitBytes: number) => {
      if (selectedUserIds.length === 0) return

      setIsLoading(true)
      try {
        for (const userId of selectedUserIds) {
          await updateStorageLimitMutation.mutateAsync({
            userId,
            storageLimitBytes,
          })
        }
        toast.success('Storage limit updated')
        clearSelection()
        onUserUpdate?.()
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to update storage limit'
        toast.error(message)
      } finally {
        setIsLoading(false)
      }
    },
    [selectedUserIds, updateStorageLimitMutation, clearSelection, onUserUpdate],
  )

  const handleBulkRoleChange = useCallback(
    async (isAdmin: boolean) => {
      if (selectedUserIds.length === 0) return

      setIsLoading(true)
      try {
        for (const userId of selectedUserIds) {
          await updateRoleMutation.mutateAsync({ userId, isAdmin })
        }
        toast.success(`Users ${isAdmin ? 'made admin' : 'made regular users'}`)
        clearSelection()
        onUserUpdate?.()
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to update roles'
        toast.error(message)
      } finally {
        setIsLoading(false)
      }
    },
    [selectedUserIds, updateRoleMutation, clearSelection, onUserUpdate],
  )

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Users</h2>
        <p className="text-sm text-muted-foreground">
          Manage user accounts, roles, and access permissions
        </p>
      </div>
      <UsersTable
        users={users}
        selectedUsers={selectedUserIds}
        onSelectionChange={setSelectedUserIds}
        onViewUserFiles={onViewUserFiles}
        onRoleChange={handleRoleChange}
        onBan={handleBanUser}
        onDelete={handleDeleteUser}
        onUpdateStorage={handleUpdateStorageUser}
      />
      <AdminFloatingActionBar
        selectedCount={selectedUserIds.length}
        onClear={clearSelection}
        onBan={handleBan}
        onDelete={handleDelete}
        onUpdateStorage={handleUpdateStorage}
        onMakeAdmin={() => handleBulkRoleChange(true)}
        onMakeUser={() => handleBulkRoleChange(false)}
        isLoading={isLoading}
      />
    </div>
  )
}
