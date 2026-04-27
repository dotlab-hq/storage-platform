import { useCallback, useMemo, useOptimistic, useTransition } from 'react'
import { createClientOnlyFn } from '@tanstack/react-start'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'
import { toast } from '@/components/ui/sonner'
import { STORAGE_QUERY_KEYS } from '@/lib/query-keys'
import type { TrashItem } from '@/lib/trash-queries'
import {
  listTrashFolderContentsFn,
  restoreTrashItemsFn,
  permanentDeleteTrashItemsFn,
} from '@/lib/storage/mutations/trash'

const checkAuthClient = createClientOnlyFn(async () => {
  const { data, error } = await authClient.getSession()
  if (error || !data?.user) {
    window.location.href = '/auth'
    return null
  }
  return data.user.id
})

export function useTrashData(params: { parentFolderId?: string | null } = {}) {
  const { parentFolderId = null } = params
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()

  // Query for trash items
  const trashQuery = useQuery({
    queryKey: ['trash-items', parentFolderId],
    queryFn: async () => {
      const uid = await checkAuthClient()
      if (!uid) throw new Error('Not authenticated')
      const data = await listTrashFolderContentsFn({ data: { parentFolderId } })
      return { items: data.items, userId: uid }
    },
    staleTime: 10_000,
  })

  const serverItems = useMemo(
    () => trashQuery.data?.items ?? [],
    [trashQuery.data],
  )

  const userId = useMemo(
    () => trashQuery.data?.userId ?? null,
    [trashQuery.data],
  )

  // Optimistic state for trash items
  const [optimisticItems, removeOptimistic] = useOptimistic<
    TrashItem[],
    string[]
  >(serverItems, (currentItems, idsToRemove) =>
    currentItems.filter((item) => !idsToRemove.includes(item.id)),
  )

  // Restore mutation with optimistic update
  const restoreMutation = useMutation({
    mutationFn: async ({
      itemIds,
      itemTypes,
    }: {
      itemIds: string[]
      itemTypes: ('file' | 'folder')[]
    }) => {
      await restoreTrashItemsFn({ data: { itemIds, itemTypes } })
    },
    onMutate: ({ itemIds }) => {
      startTransition(() => {
        removeOptimistic(itemIds)
      })
    },
    onSuccess: (_, { itemIds }) => {
      toast.success(
        itemIds.length === 1
          ? 'Item restored'
          : `${itemIds.length} items restored`,
      )
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Restore failed')
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ['trash-items'],
      })
      void queryClient.invalidateQueries({
        queryKey: STORAGE_QUERY_KEYS.quota,
      })
    },
  })

  // Permanent delete mutation with optimistic update
  const permanentDeleteMutation = useMutation({
    mutationFn: async ({
      itemIds,
      itemTypes,
    }: {
      itemIds: string[]
      itemTypes: ('file' | 'folder')[]
    }) => {
      await permanentDeleteTrashItemsFn({ data: { itemIds, itemTypes } })
    },
    onMutate: ({ itemIds }) => {
      startTransition(() => {
        removeOptimistic(itemIds)
      })
    },
    onSuccess: (_, { itemIds }) => {
      toast.success(
        itemIds.length === 1
          ? 'Permanently deleted'
          : `${itemIds.length} items deleted`,
      )
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ['trash-items'],
      })
      void queryClient.invalidateQueries({
        queryKey: STORAGE_QUERY_KEYS.quota,
      })
    },
  })

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: ['trash-items'],
    })
  }, [queryClient])

  const handleRestore = useCallback(
    async (itemIds: string[], itemTypes: ('file' | 'folder')[]) => {
      if (!userId || itemIds.length === 0) return
      restoreMutation.mutate({ itemIds, itemTypes })
    },
    [userId, restoreMutation],
  )

  const handlePermanentDelete = useCallback(
    async (itemIds: string[], itemTypes: ('file' | 'folder')[]) => {
      if (!userId || itemIds.length === 0) return
      permanentDeleteMutation.mutate({ itemIds, itemTypes })
    },
    [userId, permanentDeleteMutation],
  )

  const isLoading = useMemo(
    () => trashQuery.isLoading || isPending,
    [trashQuery.isLoading, isPending],
  )

  return {
    userId,
    items: optimisticItems,
    isLoading,
    refresh,
    handleRestore,
    handlePermanentDelete,
  }
}
