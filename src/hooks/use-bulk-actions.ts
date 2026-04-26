import { useCallback, useMemo, useOptimistic, useRef, useTransition } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/sonner'
import { STORAGE_QUERY_KEYS } from '@/lib/query-keys'
import type { StorageItem } from '@/types/storage'
import { deleteItemsFn } from '@/lib/storage/mutations/delete'
import { moveItemsFn } from '@/lib/storage/mutations/move'

function getItemTypes(ids: string[], items: StorageItem[]) {
  return ids.map((id) => {
    const item = items.find((entry) => entry.id === id)
    return item?.type ?? 'file'
  })
}

type UseBulkActionsParams = {
  userId: string | null
  items: StorageItem[]
  selectedIds: Set<string>
  setItems: React.Dispatch<React.SetStateAction<StorageItem[]>>
  clearSelection: () => void
  refresh: () => Promise<void>
  setDeleteOpen: (open: boolean) => void
  setMoveOpen: (open: boolean) => void
}

export function useBulkActions({
  userId,
  items,
  selectedIds,
  setItems,
  clearSelection,
  refresh,
  setDeleteOpen,
  setMoveOpen,
}: UseBulkActionsParams) {
  const queryClient = useQueryClient()
  const selectedIdsRef = useRef(selectedIds)
  selectedIdsRef.current = selectedIds
  const [, startTransition] = useTransition()

  // Optimistic state for items during bulk operations
  const [, addOptimisticRemoval] = useOptimistic<
    StorageItem[],
    Set<string>
  >(items, (currentItems, idsToRemove) =>
    currentItems.filter((item) => !idsToRemove.has(item.id)),
  )

  // Memoized query key for the current folder
  const currentFolderId = useMemo(() => {
    const firstItem = items[0]
    if (!firstItem) return null
    return firstItem.type === 'folder'
      ? firstItem.parentFolderId
      : firstItem.folderId ?? null
  }, [items])

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async ({
      ids,
      types,
    }: {
      ids: string[]
      types: ('file' | 'folder')[]
    }) => {
      await deleteItemsFn({ data: { itemIds: ids, itemTypes: types } })
    },
    onMutate: ({ ids }) => {
      const idSet = new Set(ids)
      // Optimistic removal with useTransition
      startTransition(() => {
        addOptimisticRemoval(idSet)
        setItems((previous) => previous.filter((item) => !idSet.has(item.id)))
      })
      clearSelection()
      setDeleteOpen(false)
    },
    onError: (error) => {
      void refresh()
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete items',
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: STORAGE_QUERY_KEYS.folderItems(currentFolderId),
      })
      void queryClient.invalidateQueries({
        queryKey: STORAGE_QUERY_KEYS.quota,
      })
    },
  })

  // Move mutation
  const moveMutation = useMutation({
    mutationFn: async ({
      ids,
      types,
      targetFolderId,
    }: {
      ids: string[]
      types: ('file' | 'folder')[]
      targetFolderId: string | null
    }) => {
      await moveItemsFn({
        data: { itemIds: ids, itemTypes: types, targetFolderId },
      })
    },
    onMutate: ({ ids }) => {
      const idSet = new Set(ids)
      startTransition(() => {
        addOptimisticRemoval(idSet)
        setItems((previous) => previous.filter((item) => !idSet.has(item.id)))
      })
      clearSelection()
      setMoveOpen(false)
    },
    onError: () => {
      void refresh()
      toast.error('Failed to move items')
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: STORAGE_QUERY_KEYS.folderItems(currentFolderId),
      })
    },
  })

  // Drag-move mutation
  const dragMoveMutation = useMutation({
    mutationFn: async ({
      itemId,
      itemType,
      targetFolderId,
    }: {
      itemId: string
      itemType: 'file' | 'folder'
      targetFolderId: string
    }) => {
      await moveItemsFn({
        data: {
          itemIds: [itemId],
          itemTypes: [itemType],
          targetFolderId,
        },
      })
    },
    onMutate: ({ itemId }) => {
      startTransition(() => {
        setItems((previous) => previous.filter((item) => item.id !== itemId))
      })
    },
    onError: () => {
      void refresh()
      toast.error('Failed to move item')
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: STORAGE_QUERY_KEYS.folderItems(currentFolderId),
      })
    },
  })

  const handleDelete = useCallback(
    async (ids: string[], types: ('file' | 'folder')[]) => {
      if (!userId || ids.length === 0) return
      deleteMutation.mutate({ ids, types })
    },
    [userId, deleteMutation],
  )

  const handleMove = useCallback(
    async (targetFolderId: string | null) => {
      if (!userId) return
      const ids = Array.from(selectedIdsRef.current)
      if (ids.length === 0) return
      const types = getItemTypes(ids, items)
      moveMutation.mutate({ ids, types, targetFolderId })
    },
    [userId, items, moveMutation],
  )

  const handleDragMoveItem = useCallback(
    async (
      itemId: string,
      itemType: 'file' | 'folder',
      targetFolderId: string,
    ) => {
      if (!userId) return
      dragMoveMutation.mutate({ itemId, itemType, targetFolderId })
    },
    [userId, dragMoveMutation],
  )

  return { handleDelete, handleMove, handleDragMoveItem }
}
