import { useStore } from '@tanstack/react-store'
import { Store } from '@tanstack/store'
import { setHasSelectedFiles } from '@/lib/stores/file-selection-ui-store'
import type { StorageItem } from '@/types/storage'

type FileSelectionState = {
  selectedIds: Set<string>
  lastSelectedId: string | null
}

type FileSelectionActions = {
  select: (id: string, shiftKey: boolean, items: StorageItem[]) => void
  toggleSelect: (id: string) => void
  clearSelection: () => void
  selectMany: (ids: string[], append?: boolean) => void
  selectAll: (items: StorageItem[]) => void
  isSelected: (id: string) => boolean
}

type FileSelectionSnapshot = FileSelectionState & FileSelectionActions

const initialState: FileSelectionState = {
  selectedIds: new Set(),
  lastSelectedId: null,
}

export const fileSelectionStore = new Store<FileSelectionState>(initialState)

const updateSelection = (nextSelected: Set<string>, lastSelectedId: string | null) => {
  setHasSelectedFiles(nextSelected.size > 0)
  fileSelectionStore.setState(() => ({
    selectedIds: nextSelected,
    lastSelectedId,
  }))
}

export const select = (id: string, shiftKey: boolean, items: StorageItem[]): void => {
  const state = fileSelectionStore.state
  if (shiftKey && state.lastSelectedId) {
    const lastIndex = items.findIndex((item) => item.id === state.lastSelectedId)
    const currentIndex = items.findIndex((item) => item.id === id)

    if (lastIndex === -1 || currentIndex === -1) {
      updateSelection(new Set([id]), id)
      return
    }

    const start = Math.min(lastIndex, currentIndex)
    const end = Math.max(lastIndex, currentIndex)
    const rangeIds = items.slice(start, end + 1).map((item) => item.id)
    const next = new Set([...state.selectedIds, ...rangeIds])
    updateSelection(next, id)
    return
  }

  updateSelection(new Set([id]), id)
}

export const toggleSelect = (id: string): void => {
  const next = new Set(fileSelectionStore.state.selectedIds)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  updateSelection(next, id)
}

export const clearSelection = (): void => {
  updateSelection(new Set(), null)
}

export const selectMany = (ids: string[], append = false): void => {
  const state = fileSelectionStore.state
  const nextSelected = append ? new Set(state.selectedIds) : new Set<string>()
  ids.forEach((id) => nextSelected.add(id))
  const lastId =
    ids.length > 0 ? ids[ids.length - 1] : append ? state.lastSelectedId : null
  updateSelection(nextSelected, lastId)
}

export const selectAll = (items: StorageItem[]): void => {
  const next = new Set(items.map((item) => item.id))
  updateSelection(next, items[items.length - 1]?.id ?? null)
}

export const isSelected = (id: string): boolean =>
  fileSelectionStore.state.selectedIds.has(id)

const getSnapshot = (state: FileSelectionState): FileSelectionSnapshot => ({
  ...state,
  select,
  toggleSelect,
  clearSelection,
  selectMany,
  selectAll,
  isSelected,
})

export function useFileSelectionStore<T>(
  selector: (state: FileSelectionSnapshot) => T,
): T
export function useFileSelectionStore(): FileSelectionSnapshot
export function useFileSelectionStore<T>(
  selector?: (state: FileSelectionSnapshot) => T,
) {
  return useStore(fileSelectionStore, (state) => {
    const snapshot = getSnapshot(state)
    return selector ? selector(snapshot) : snapshot
  })
}
