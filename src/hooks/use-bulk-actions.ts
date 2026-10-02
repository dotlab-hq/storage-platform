import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/sonner'
import { STORAGE_QUERY_KEYS } from '@/lib/query-keys'
import { deleteItemsFn } from '@/lib/storage/mutations/delete'
import { moveItemsFn } from '@/lib/storage/mutations/move'
import {
  folderItemsQuery,
  refreshAllFolders,
  refreshFolder,
  removeFolderItems,
} from '@/lib/storage/folder-query'
import { useSelectionStore } from '@/stores/selection-store'
import type { StorageItem } from '@/types/storage'

type ItemRef = Pick<StorageItem, 'id' | 'type'>

function toPayload(items: ItemRef[]) {
  return {
    itemIds: items.map((item) => item.id),
    itemTypes: items.map((item) => item.type),
  }
}

/**
 * Multi-item operations for the file browser (move to trash, move, drag
 * onto a folder). Items disappear from the grid immediately; if the server
 * call fails the folder is refetched, which brings them back.
 */
export function useBulkActions(folderId: string | null) {
  const queryClient = useQueryClient()

  const removeOptimistically = useCallback(
    async (items: ItemRef[]) => {
      await queryClient.cancelQueries({
        queryKey: folderItemsQuery(folderId).queryKey,
      })
      removeFolderItems(
        queryClient,
        folderId,
        items.map((item) => item.id),
      )
      useSelectionStore.getState().clear()
    },
    [folderId, queryClient],
  )

  const trashMutation = useMutation({
    mutationFn: (items: ItemRef[]) =>
      deleteItemsFn({ data: toPayload(items) }),
    onMutate: removeOptimistically,
    onSuccess: (_result, items) =>
      toast.success(
        `Moved ${items.length} item${items.length > 1 ? 's' : ''} to trash`,
      ),
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : 'Delete failed'),
    onSettled: () =>
      Promise.all([
        refreshFolder(queryClient, folderId),
        queryClient.invalidateQueries({ queryKey: STORAGE_QUERY_KEYS.trash }),
      ]),
  })

  const moveMutation = useMutation({
    mutationFn: ({
      items,
      targetFolderId,
    }: {
      items: ItemRef[]
      targetFolderId: string | null
    }) =>
      moveItemsFn({ data: { ...toPayload(items), targetFolderId } }),
    onMutate: ({ items, targetFolderId }) =>
      // Moving into the folder we're looking at changes nothing visible.
      targetFolderId === folderId ? undefined : removeOptimistically(items),
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : 'Move failed'),
    // Both the source and the destination folder changed.
    onSettled: () => refreshAllFolders(queryClient),
  })

  return {
    moveToTrash: useCallback(
      (items: ItemRef[]) => {
        if (items.length > 0) trashMutation.mutate(items)
      },
      [trashMutation],
    ),
    move: useCallback(
      (items: ItemRef[], targetFolderId: string | null) => {
        if (items.length > 0) moveMutation.mutate({ items, targetFolderId })
      },
      [moveMutation],
    ),
    isMoving: moveMutation.isPending,
  }
}
