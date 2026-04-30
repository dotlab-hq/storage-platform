'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AdminUser } from '@/lib/storage-provider-queries'
import {
  updateUserRoleFn,
  banUsersFn,
  deleteUsersFn,
  updateUserStorageLimitFn,
  updateUserFileSizeLimitFn,
} from '@/routes/_app/admin/-components/-admin-server'

const ADMIN_USERS_QUERY_KEY = ['admin-users'] as const

export function useAdminUsersMutations() {
  const queryClient = useQueryClient()

  const updateRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      isAdmin,
    }: {
      userId: string
      isAdmin: boolean
    }) => {
      const result = await updateUserRoleFn({ data: { userId, isAdmin } })
      return result
    },
    onMutate: async ({ userId, isAdmin }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ADMIN_USERS_QUERY_KEY })

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData<AdminUser[]>(
        ADMIN_USERS_QUERY_KEY,
      )

      // Optimistically update
      queryClient.setQueryData<AdminUser[]>(ADMIN_USERS_QUERY_KEY, (old) => {
        if (!old) return old
        return old.map((user) =>
          user.id === userId ? { ...user, isAdmin } : user,
        )
      })

      return { previousUsers }
    },
    onError: (err, variables, context) => {
      void err
      void variables
      // If the mutation fails, revert to previous value
      if (context?.previousUsers) {
        queryClient.setQueryData(ADMIN_USERS_QUERY_KEY, context.previousUsers)
      }
    },
    onSettled: () => {
      // Refetch to ensure server state is correct
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY })
    },
  })

  const banUsersMutation = useMutation({
    mutationFn: async ({
      userIds,
      banned,
    }: {
      userIds: string[]
      banned: boolean
    }) => {
      const result = await banUsersFn({ data: { userIds, banned } })
      return result
    },
    onMutate: async ({ userIds, banned }) => {
      await queryClient.cancelQueries({ queryKey: ADMIN_USERS_QUERY_KEY })
      const previousUsers = queryClient.getQueryData<AdminUser[]>(
        ADMIN_USERS_QUERY_KEY,
      )

      queryClient.setQueryData<AdminUser[]>(ADMIN_USERS_QUERY_KEY, (old) => {
        if (!old) return old
        return old.map((user) =>
          userIds.includes(user.id) ? { ...user, banned } : user,
        )
      })

      return { previousUsers }
    },
    onError: (err, variables, context) => {
      void err
      void variables
      if (context?.previousUsers) {
        queryClient.setQueryData(ADMIN_USERS_QUERY_KEY, context.previousUsers)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY })
    },
  })

  const deleteUsersMutation = useMutation({
    mutationFn: async ({ userIds }: { userIds: string[] }) => {
      const result = await deleteUsersFn({ data: { userIds } })
      return result
    },
    onMutate: async ({ userIds }) => {
      await queryClient.cancelQueries({ queryKey: ADMIN_USERS_QUERY_KEY })
      const previousUsers = queryClient.getQueryData<AdminUser[]>(
        ADMIN_USERS_QUERY_KEY,
      )

      queryClient.setQueryData<AdminUser[]>(ADMIN_USERS_QUERY_KEY, (old) => {
        if (!old) return old
        return old.filter((user) => !userIds.includes(user.id))
      })

      return { previousUsers }
    },
    onError: (err, variables, context) => {
      void err
      void variables
      if (context?.previousUsers) {
        queryClient.setQueryData(ADMIN_USERS_QUERY_KEY, context.previousUsers)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY })
    },
  })

  const updateStorageLimitMutation = useMutation({
    mutationFn: async ({
      userId,
      storageLimitBytes,
    }: {
      userId: string
      storageLimitBytes: number
    }) => {
      const result = await updateUserStorageLimitFn({
        data: { userId, storageLimitBytes },
      })
      return result
    },
    onMutate: async ({ userId, storageLimitBytes }) => {
      await queryClient.cancelQueries({ queryKey: ADMIN_USERS_QUERY_KEY })
      const previousUsers = queryClient.getQueryData<AdminUser[]>(
        ADMIN_USERS_QUERY_KEY,
      )

      queryClient.setQueryData<AdminUser[]>(ADMIN_USERS_QUERY_KEY, (old) => {
        if (!old) return old
        return old.map((user) =>
          user.id === userId ? { ...user, storageLimitBytes } : user,
        )
      })

      return { previousUsers }
    },
    onError: (err, variables, context) => {
      void err
      void variables
      if (context?.previousUsers) {
        queryClient.setQueryData(ADMIN_USERS_QUERY_KEY, context.previousUsers)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY })
    },
  })

  const updateFileSizeLimitMutation = useMutation({
    mutationFn: async ({
      userId,
      fileSizeLimitBytes,
    }: {
      userId: string
      fileSizeLimitBytes: number
    }) => {
      const result = await updateUserFileSizeLimitFn({
        data: { userId, fileSizeLimitBytes },
      })
      return result
    },
    onMutate: async ({ userId, fileSizeLimitBytes }) => {
      await queryClient.cancelQueries({ queryKey: ADMIN_USERS_QUERY_KEY })
      const previousUsers = queryClient.getQueryData<AdminUser[]>(
        ADMIN_USERS_QUERY_KEY,
      )

      queryClient.setQueryData<AdminUser[]>(ADMIN_USERS_QUERY_KEY, (old) => {
        if (!old) return old
        return old.map((user) =>
          user.id === userId ? { ...user, fileSizeLimitBytes } : user,
        )
      })

      return { previousUsers }
    },
    onError: (err, variables, context) => {
      void err
      void variables
      if (context?.previousUsers) {
        queryClient.setQueryData(ADMIN_USERS_QUERY_KEY, context.previousUsers)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY })
    },
  })

  return {
    updateRoleMutation,
    banUsersMutation,
    deleteUsersMutation,
    updateStorageLimitMutation,
    updateFileSizeLimitMutation,
  }
}
