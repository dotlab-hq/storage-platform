import { useCallback, useRef } from 'react'
import { toast } from '@/components/ui/sonner'
import type { StorageItem } from '@/types/storage'
import { deleteItemsFn } from '@/lib/storage/mutations/delete'
import { moveItemsFn } from '@/lib/storage/mutations/move'

function getItemTypes(ids: string[], items: StorageItem[]) {
  return ids.map((id) => {
    const item = items.find((i) => i.id === id)
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
      setItems((prev) => prev.filter((i) => !idSet.has(i.id)))
      clearSelection()
      setDeleteOpen(false)
      try {
        await deleteItemsFn({ data: { itemIds: ids, itemTypes: types } })
        toast.success('Moved to Trash')
      } catch (err) {
        void refresh()
        toast.error(
          err instanceof Error ? err.message : 'Failed to delete items',
        )
      }
    },
    [userId, setItems, clearSelection, refresh, setDeleteOpen],
  )

  const handleMove = useCallback(
    async (targetFolderId: string | null) => {
      if (!userId) return
      const ids = Array.from(selectedIdsRef.current)
      if (ids.length === 0) return
      const types = getItemTypes(ids, items)
      setItems((prev) => prev.filter((i) => !selectedIdsRef.current.has(i.id)))
      clearSelection()
      setMoveOpen(false)
      try {
        await moveItemsFn({
          data: { itemIds: ids, itemTypes: types, targetFolderId },
        })
        toast.success('Items moved')
      } catch {
        void refresh()
        toast.error('Failed to move items')
      }
    },
    [userId, items, setItems, clearSelection, refresh, setMoveOpen],
  )

  const handleDragMoveItem = useCallback(
    async (
      itemId: string,
      itemType: 'file' | 'folder',
      targetFolderId: string,
    ) => {
      if (!userId) return
      setItems((prev) => prev.filter((i) => i.id !== itemId))
      try {
        await moveItemsFn({
          data: { itemIds: [itemId], itemTypes: [itemType], targetFolderId },
        })
        toast.success('Item moved')
      } catch {
        void refresh()
        toast.error('Failed to move item')
      }
    },
    [userId, setItems, refresh],
  )

  return { handleDelete, handleMove, handleDragMoveItem }
}
