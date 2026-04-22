import { useCallback, useRef } from 'react'
import { toast } from '@/components/ui/sonner'
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
  const selectedIdsRef = useRef(selectedIds)
  selectedIdsRef.current = selectedIds

  const handleDelete = useCallback(
    async (ids: string[], types: ('file' | 'folder')[]) => {
      if (!userId || ids.length === 0) return

      const idSet = new Set(ids)
      setItems((previous) => previous.filter((item) => !idSet.has(item.id)))
      clearSelection()
      setDeleteOpen(false)
      try {
        await deleteItemsFn({ data: { itemIds: ids, itemTypes: types } })
      } catch (error) {
        void refresh()
        toast.error(
          error instanceof Error ? error.message : 'Failed to delete items',
        )
      }
    },
    [clearSelection, refresh, setDeleteOpen, setItems, userId],
  )

  const handleMove = useCallback(
    async (targetFolderId: string | null) => {
      if (!userId) return

      const ids = Array.from(selectedIdsRef.current)
      if (ids.length === 0) return

      const types = getItemTypes(ids, items)
      setItems((previous) =>
        previous.filter((item) => !selectedIdsRef.current.has(item.id)),
      )
      clearSelection()
      setMoveOpen(false)
      try {
        await moveItemsFn({
          data: { itemIds: ids, itemTypes: types, targetFolderId },
        })
      } catch {
        void refresh()
        toast.error('Failed to move items')
      }
    },
    [clearSelection, items, refresh, setItems, setMoveOpen, userId],
  )

  const handleDragMoveItem = useCallback(
    async (
      itemId: string,
      itemType: 'file' | 'folder',
      targetFolderId: string,
    ) => {
      if (!userId) return

      setItems((previous) => previous.filter((item) => item.id !== itemId))
      try {
        await moveItemsFn({
          data: { itemIds: [itemId], itemTypes: [itemType], targetFolderId },
        })
      } catch {
        void refresh()
        toast.error('Failed to move item')
      }
    },
    [refresh, setItems, userId],
  )

  return { handleDelete, handleMove, handleDragMoveItem }
}
