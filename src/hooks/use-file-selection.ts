import { useCallback, useEffect, useLayoutEffect, useMemo } from 'react'
import { useFileSelectionStore } from '@/stores/file-selection-store'
import { setHasSelectedFiles } from '@/lib/stores/file-selection-ui-store'
import type { StorageItem } from '@/types/storage'

export function useFileSelection(items: StorageItem[]) {
  const selectedIds = useFileSelectionStore((s) => s.selectedIds)
  const lastSelectedId = useFileSelectionStore((s) => s.lastSelectedId)
  const storeSelect = useFileSelectionStore((s) => s.select)
  const storeToggleSelect = useFileSelectionStore((s) => s.toggleSelect)
  const storeClearSelection = useFileSelectionStore((s) => s.clearSelection)
  const storeSelectMany = useFileSelectionStore((s) => s.selectMany)
  const storeSelectAll = useFileSelectionStore((s) => s.selectAll)

  // Sync UI store with useLayoutEffect (before paint)
  useLayoutEffect(() => {
    setHasSelectedFiles(selectedIds.size > 0)
  }, [selectedIds.size])

  useEffect(() => {
    return () => setHasSelectedFiles(false)
  }, [])

  // Memoize selected count to avoid recomputation
  const selectedCount = useMemo(() => selectedIds.size, [selectedIds])

  // Wrap store methods to inject items dependency
  const select = useCallback(
    (id: string, shiftKey = false) => storeSelect(id, shiftKey, items),
    [items, storeSelect],
  )

  const toggleSelect = useCallback(
    (id: string) => storeToggleSelect(id),
    [storeToggleSelect],
  )

  const clearSelection = useCallback(
    () => storeClearSelection(),
    [storeClearSelection],
  )

  const selectMany = useCallback(
    (ids: string[], append = false) => storeSelectMany(ids, append),
    [storeSelectMany],
  )

  const selectAll = useCallback(
    () => storeSelectAll(items),
    [items, storeSelectAll],
  )

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  )

  return {
    selectedIds,
    selectedCount,
    select,
    toggleSelect,
    selectMany,
    clearSelection,
    selectAll,
    isSelected,
  }
}
