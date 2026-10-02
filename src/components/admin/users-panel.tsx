import { useMemo, useState } from 'react'
import { toast } from '@/components/ui/sonner'
import type { AdminUser } from '@/lib/storage-provider-queries'
import { useAdminUsersMutations } from '@/hooks/use-admin-users.mutations'
import { useSelectionStore } from '@/stores/selection-store'
import { AdminFloatingActionBar } from './floating-action-bar'
import { UserFilesModal } from './user-files-modal'
import { UsersTable } from './users-table'
import type { UserActions } from './users-table-columns'

/**
 * Runs a mutation and shows a success toast. Errors are toasted by the
 * mutation itself, so this only reports whether it worked.
 */
async function succeeded(action: () => Promise<unknown>, message: string) {
  try {
    await action()
    toast.success(message)
    return true
  } catch {
    return false
  }
}

/**
 * The admin "Users" tab: table, per-row actions, bulk actions and the
 * user-files viewer. Selected user ids live in the shared selection store so
 * the dock gives way to the bulk action bar.
 */
export function UsersPanel({ users }: { users: AdminUser[] }) {
  const mutations = useAdminUsersMutations()
  const [viewingUser, setViewingUser] = useState<AdminUser | null>(null)
  const [isBulkPending, setIsBulkPending] = useState(false)

  const storeSelection = useSelectionStore((state) => state.selectedIds)
  // Only ids of users that still exist (e.g. after a delete) count.
  const selectedIds = useMemo(
    () => users.filter((user) => storeSelection.has(user.id)).map((u) => u.id),
    [users, storeSelection],
  )
  const setSelection = (ids: string[]) =>
    useSelectionStore.getState().selectMany(ids)
  const clearSelection = () => useSelectionStore.getState().clear()

  const updateRole = mutations.updateRoleMutation.mutateAsync
  const banUsers = mutations.banUsersMutation.mutateAsync
  const deleteUsers = mutations.deleteUsersMutation.mutateAsync
  const updateStorage = mutations.updateStorageLimitMutation.mutateAsync
  const updateFileSize = mutations.updateFileSizeLimitMutation.mutateAsync

  const actions = useMemo<UserActions>(
    () => ({
      onRoleChange: (userId, isAdmin) =>
        succeeded(() => updateRole({ userId, isAdmin }), 'User role updated'),
      onBan: (userId, banned) =>
        succeeded(
          () => banUsers({ userIds: [userId], banned }),
          banned ? 'User banned' : 'User unbanned',
        ),
      onDelete: (userId) =>
        succeeded(() => deleteUsers({ userIds: [userId] }), 'User deleted'),
      onUpdateStorage: (userId, storageLimitBytes) =>
        succeeded(
          () => updateStorage({ userId, storageLimitBytes }),
          'Storage limit updated',
        ),
      onUpdateFileSizeLimit: (userId, fileSizeLimitBytes) =>
        succeeded(
          () => updateFileSize({ userId, fileSizeLimitBytes }),
          'File size limit updated',
        ),
      onViewFiles: setViewingUser,
    }),
    [updateRole, banUsers, deleteUsers, updateStorage, updateFileSize],
  )

  /** Applies an action to every selected user, then clears the selection. */
  const runBulk = async (
    action: (userIds: string[]) => Promise<unknown>,
    message: string,
  ) => {
    setIsBulkPending(true)
    const ok = await succeeded(() => action(selectedIds), message)
    setIsBulkPending(false)
    if (ok) clearSelection()
    return ok
  }

  /** For endpoints that take one user at a time. */
  const forEachUser =
    (update: (userId: string) => Promise<unknown>) =>
    async (userIds: string[]) => {
      for (const userId of userIds) await update(userId)
    }

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
        actions={actions}
        selectedIds={selectedIds}
        onSelectionChange={setSelection}
      />
      <AdminFloatingActionBar
        selectedCount={selectedIds.length}
        isPending={isBulkPending}
        onClear={clearSelection}
        onBan={(banned) =>
          runBulk(
            (userIds) => banUsers({ userIds, banned }),
            banned ? 'User(s) banned' : 'User(s) unbanned',
          )
        }
        onSetAdmin={(isAdmin) =>
          runBulk(
            forEachUser((userId) => updateRole({ userId, isAdmin })),
            isAdmin ? 'Users made admin' : 'Users made regular users',
          )
        }
        onUpdateStorage={(storageLimitBytes) =>
          runBulk(
            forEachUser((userId) =>
              updateStorage({ userId, storageLimitBytes }),
            ),
            'Storage limit updated',
          )
        }
        onUpdateFileSizeLimit={(fileSizeLimitBytes) =>
          runBulk(
            forEachUser((userId) =>
              updateFileSize({ userId, fileSizeLimitBytes }),
            ),
            'File size limit updated',
          )
        }
        onDelete={() =>
          runBulk((userIds) => deleteUsers({ userIds }), 'User(s) deleted')
        }
      />
      {viewingUser && (
        <UserFilesModal
          user={viewingUser}
          open
          onOpenChange={(open) => !open && setViewingUser(null)}
        />
      )}
    </div>
  )
}
