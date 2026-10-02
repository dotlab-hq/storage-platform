import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/sonner'
import type { AdminUser } from '@/lib/storage-provider-queries'
import {
  adminUsersQuery,
  refreshAdminQueries,
} from '@/routes/_app/admin/-admin-queries'
import type { AdminQueryName } from '@/routes/_app/admin/-admin-queries'
import {
  banUsersFn,
  deleteUsersFn,
  updateUserRoleFn,
} from '@/routes/_app/admin/-components/-admin-user-role-fns'
import {
  updateUserFileSizeLimitFn,
  updateUserStorageLimitFn,
} from '@/routes/_app/admin/-components/-admin-user-storage-fns'

type OptimisticUsersMutation<TVariables> = {
  mutationFn: (variables: TVariables) => Promise<unknown>
  /** Applies the change to the cached user list before the server answers. */
  applyOptimistic: (users: AdminUser[], variables: TVariables) => AdminUser[]
  errorMessage: string
  /** Admin queries the change can affect (the user list is always refetched). */
  alsoRefresh?: AdminQueryName[]
}

/**
 * A mutation on the admin user list: optimistic cache update, rollback and
 * error toast on failure, and one refetch of the affected queries when done.
 */
function useOptimisticUsersMutation<TVariables>({
  mutationFn,
  applyOptimistic,
  errorMessage,
  alsoRefresh = [],
}: OptimisticUsersMutation<TVariables>) {
  const queryClient = useQueryClient()
  const { queryKey } = adminUsersQuery()

  return useMutation({
    mutationFn,
    onMutate: async (variables: TVariables) => {
      await queryClient.cancelQueries({ queryKey })
      const previousUsers = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, (users) =>
        users ? applyOptimistic(users, variables) : users,
      )
      return { previousUsers }
    },
    onError: (error, _variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(queryKey, context.previousUsers)
      }
      toast.error(error instanceof Error ? error.message : errorMessage)
    },
    onSettled: () =>
      refreshAdminQueries(queryClient, ['users', ...alsoRefresh]),
  })
}

/** Patches the users whose id is in `ids`. */
function patchUsers(
  users: AdminUser[],
  ids: string[],
  patch: Partial<AdminUser>,
) {
  return users.map((user) =>
    ids.includes(user.id) ? { ...user, ...patch } : user,
  )
}

/** Role, ban, delete and quota mutations used by the admin users panel. */
export function useAdminUsersMutations() {
  const updateRoleMutation = useOptimisticUsersMutation({
    mutationFn: ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) =>
      updateUserRoleFn({ data: { userId, isAdmin } }),
    applyOptimistic: (users, { userId, isAdmin }) =>
      patchUsers(users, [userId], { isAdmin }),
    errorMessage: 'Failed to update user role',
  })

  const banUsersMutation = useOptimisticUsersMutation({
    mutationFn: ({ userIds, banned }: { userIds: string[]; banned: boolean }) =>
      banUsersFn({ data: { userIds, banned } }),
    applyOptimistic: (users, { userIds, banned }) =>
      patchUsers(users, userIds, { banned }),
    errorMessage: 'Failed to update ban status',
    alsoRefresh: ['providers'],
  })

  const deleteUsersMutation = useOptimisticUsersMutation({
    mutationFn: ({ userIds }: { userIds: string[] }) =>
      deleteUsersFn({ data: { userIds } }),
    applyOptimistic: (users, { userIds }) =>
      users.filter((user) => !userIds.includes(user.id)),
    errorMessage: 'Failed to delete user(s)',
    // Deleting users removes their files: counts and provider usage change.
    alsoRefresh: ['summary', 'providers'],
  })

  const updateStorageLimitMutation = useOptimisticUsersMutation({
    mutationFn: ({
      userId,
      storageLimitBytes,
    }: {
      userId: string
      storageLimitBytes: number
    }) => updateUserStorageLimitFn({ data: { userId, storageLimitBytes } }),
    applyOptimistic: (users, { userId, storageLimitBytes }) =>
      patchUsers(users, [userId], { storageLimitBytes }),
    errorMessage: 'Failed to update storage limit',
  })

  const updateFileSizeLimitMutation = useOptimisticUsersMutation({
    mutationFn: ({
      userId,
      fileSizeLimitBytes,
    }: {
      userId: string
      fileSizeLimitBytes: number
    }) => updateUserFileSizeLimitFn({ data: { userId, fileSizeLimitBytes } }),
    applyOptimistic: (users, { userId, fileSizeLimitBytes }) =>
      patchUsers(users, [userId], { fileSizeLimitBytes }),
    errorMessage: 'Failed to update file size limit',
  })

  return {
    updateRoleMutation,
    banUsersMutation,
    deleteUsersMutation,
    updateStorageLimitMutation,
    updateFileSizeLimitMutation,
  }
}
