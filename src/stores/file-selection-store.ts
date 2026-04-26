import { create } from 'zustand'
import { setHasSelectedFiles } from '@/lib/stores/file-selection-ui-store'
import type { StorageItem } from '@/types/storage'

interface FileSelectionState {
  selectedIds: Set<string>
  lastSelectedId: string | null

  select: (id: string, shiftKey: boolean, items: StorageItem[]) => void
  toggleSelect: (id: string) => void
  clearSelection: () => void
  selectMany: (ids: string[], append?: boolean) => void
  selectAll: (items: StorageItem[]) => void
  isSelected: (id: string) => boolean
}

export const useFileSelectionStore = create<FileSelectionState>(
  (set, get) => ({
    selectedIds: new Set(),
    lastSelectedId: null,

    select: (id, shiftKey, items) => {
      set((state) => {
        if (shiftKey && state.lastSelectedId) {
          const lastIndex = items.findIndex(
            (item) => item.id === state.lastSelectedId,
          )
          const currentIndex = items.findIndex((item) => item.id === id)

          if (lastIndex === -1 || currentIndex === -1) {
            const next = new Set([id])
            setHasSelectedFiles(next.size > 0)
            return { selectedIds: next, lastSelectedId: id }
          }

          const start = Math.min(lastIndex, currentIndex)
          const end = Math.max(lastIndex, currentIndex)
          const rangeIds = items.slice(start, end + 1).map((item) => item.id)
          const next = new Set([...state.selectedIds, ...rangeIds])
          setHasSelectedFiles(next.size > 0)
          return { selectedIds: next, lastSelectedId: id }
        }

        const next = new Set([id])
        setHasSelectedFiles(next.size > 0)
        return { selectedIds: next, lastSelectedId: id }
      })
    },

    toggleSelect: (id) => {
      set((state) => {
        const next = new Set(state.selectedIds)
        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }
        setHasSelectedFiles(next.size > 0)
        return { selectedIds: next, lastSelectedId: id }
      })
    },

    clearSelection: () => {
      setHasSelectedFiles(false)
      set({ selectedIds: new Set(), lastSelectedId: null })
    },

    selectMany: (ids, append = false) => {
      set((state) => {
        const nextSelected = append
          ? new Set(state.selectedIds)
          : new Set<string>()
        ids.forEach((id) => nextSelected.add(id))
        const lastId =
          ids.length > 0
            ? ids[ids.length - 1]
            : append
              ? state.lastSelectedId
              : null
        setHasSelectedFiles(nextSelected.size > 0)
        return { selectedIds: nextSelected, lastSelectedId: lastId }
      })
    },

    selectAll: (items) => {
      const next = new Set(items.map((item) => item.id))
      setHasSelectedFiles(next.size > 0)
      set({
        selectedIds: next,
        lastSelectedId: items[items.length - 1]?.id ?? null,
      })
    },

    isSelected: (id) => get().selectedIds.has(id),
  }),
)
