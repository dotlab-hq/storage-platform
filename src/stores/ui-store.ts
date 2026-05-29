import { useStore } from '@tanstack/react-store'
import { Store } from '@tanstack/store'
import type { StorageItem } from '@/types/storage'

type PendingDelete = { ids: string[]; types: ('file' | 'folder')[] } | null

type UiState = {
  shareItem: StorageItem | null
  moveOpen: boolean
  moveMode: 'move' | 'update-path'
  deleteOpen: boolean
  pendingDelete: PendingDelete
  uploadFileOpen: boolean
  uploadFolderOpen: boolean
  urlImportOpen: boolean
  newFolderOpen: boolean
}

type UiActions = {
  setShareItem: (item: StorageItem | null) => void
  setMoveOpen: (open: boolean) => void
  setMoveMode: (mode: 'move' | 'update-path') => void
  setDeleteOpen: (open: boolean) => void
  setPendingDelete: (pending: PendingDelete) => void
  setUploadFileOpen: (open: boolean) => void
  setUploadFolderOpen: (open: boolean) => void
  setUrlImportOpen: (open: boolean) => void
  setNewFolderOpen: (open: boolean) => void
  openDeleteForItem: (item: StorageItem) => void
  openMoveWithMode: (mode?: 'move' | 'update-path') => void
}

type UiSnapshot = UiState & UiActions

const initialState: UiState = {
  shareItem: null,
  moveOpen: false,
  moveMode: 'move',
  deleteOpen: false,
  pendingDelete: null,
  uploadFileOpen: false,
  uploadFolderOpen: false,
  urlImportOpen: false,
  newFolderOpen: false,
}

export const uiStore = new Store<UiState>(initialState)

export const setShareItem = (item: StorageItem | null): void => {
  uiStore.setState((state) => ({ ...state, shareItem: item }))
}

export const setMoveOpen = (open: boolean): void => {
  uiStore.setState((state) => ({ ...state, moveOpen: open }))
}

export const setMoveMode = (mode: 'move' | 'update-path'): void => {
  uiStore.setState((state) => ({ ...state, moveMode: mode }))
}

export const setDeleteOpen = (open: boolean): void => {
  uiStore.setState((state) => ({ ...state, deleteOpen: open }))
}

export const setPendingDelete = (pending: PendingDelete): void => {
  uiStore.setState((state) => ({ ...state, pendingDelete: pending }))
}

export const setUploadFileOpen = (open: boolean): void => {
  uiStore.setState((state) => ({ ...state, uploadFileOpen: open }))
}

export const setUploadFolderOpen = (open: boolean): void => {
  uiStore.setState((state) => ({ ...state, uploadFolderOpen: open }))
}

export const setUrlImportOpen = (open: boolean): void => {
  uiStore.setState((state) => ({ ...state, urlImportOpen: open }))
}

export const setNewFolderOpen = (open: boolean): void => {
  uiStore.setState((state) => ({ ...state, newFolderOpen: open }))
}

export const openDeleteForItem = (item: StorageItem): void => {
  uiStore.setState((state) => ({
    ...state,
    pendingDelete: { ids: [item.id], types: [item.type] },
    deleteOpen: true,
  }))
}

export const openMoveWithMode = (mode: 'move' | 'update-path' = 'move'): void => {
  uiStore.setState((state) => ({ ...state, moveMode: mode, moveOpen: true }))
}

const getSnapshot = (state: UiState): UiSnapshot => ({
  ...state,
  setShareItem,
  setMoveOpen,
  setMoveMode,
  setDeleteOpen,
  setPendingDelete,
  setUploadFileOpen,
  setUploadFolderOpen,
  setUrlImportOpen,
  setNewFolderOpen,
  openDeleteForItem,
  openMoveWithMode,
})

export function useUiStore<T>(selector: (state: UiSnapshot) => T): T
export function useUiStore(): UiSnapshot
export function useUiStore<T>(selector?: (state: UiSnapshot) => T) {
  return useStore(uiStore, (state) => {
    const snapshot = getSnapshot(state)
    return selector ? selector(snapshot) : snapshot
  })
}
