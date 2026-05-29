import { useStore } from '@tanstack/react-store'
import { Store } from '@tanstack/store'
import type {
  BreadcrumbItem,
  StorageFolder,
  StorageItem,
  UserQuota,
} from '@/types/storage'

type StorageState = {
  userId: string | null
  currentFolderId: string | null
  items: StorageItem[]
  folders: StorageFolder[]
  breadcrumbs: BreadcrumbItem[]
  quota: UserQuota | null
  tinySessionPermission: 'read' | 'read-write' | undefined
  isNavigating: boolean
}

type StorageActions = {
  setUserId: (id: string | null) => void
  setCurrentFolderId: (id: string | null) => void
  setItems: (items: StorageItem[]) => void
  appendItems: (items: StorageItem[]) => void
  updateItem: (id: string, updates: Partial<StorageItem>) => void
  removeItems: (ids: string[]) => void
  prependItem: (item: StorageItem) => void
  setFolders: (folders: StorageFolder[]) => void
  appendFolders: (folders: StorageFolder[]) => void
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void
  setQuota: (quota: UserQuota | null) => void
  setTinySessionPermission: (p: 'read' | 'read-write' | undefined) => void
  setIsNavigating: (v: boolean) => void
}

type StorageSnapshot = StorageState & StorageActions

const initialState: StorageState = {
  userId: null,
  currentFolderId: null,
  items: [],
  folders: [],
  breadcrumbs: [],
  quota: null,
  tinySessionPermission: undefined,
  isNavigating: false,
}

export const storageStore = new Store<StorageState>(initialState)

export const setUserId = (id: string | null): void => {
  storageStore.setState((state) => ({ ...state, userId: id }))
}

export const setCurrentFolderId = (id: string | null): void => {
  storageStore.setState((state) => ({ ...state, currentFolderId: id }))
}

export const setItems = (items: StorageItem[]): void => {
  storageStore.setState((state) => ({ ...state, items }))
}

export const appendItems = (newItems: StorageItem[]): void => {
  storageStore.setState((state) => {
    const existingIds = new Set(state.items.map((item) => item.id))
    const uniqueItems = newItems.filter((item) => !existingIds.has(item.id))
    return { ...state, items: [...state.items, ...uniqueItems] }
  })
}

export const updateItem = (id: string, updates: Partial<StorageItem>): void => {
  storageStore.setState((state) => ({
    ...state,
    items: state.items.map((item) =>
      item.id === id ? ({ ...item, ...updates } as StorageItem) : item,
    ),
  }))
}

export const removeItems = (ids: string[]): void => {
  const idSet = new Set(ids)
  storageStore.setState((state) => ({
    ...state,
    items: state.items.filter((item) => !idSet.has(item.id)),
  }))
}

export const prependItem = (item: StorageItem): void => {
  storageStore.setState((state) => ({ ...state, items: [item, ...state.items] }))
}

export const setFolders = (folders: StorageFolder[]): void => {
  storageStore.setState((state) => ({ ...state, folders }))
}

export const appendFolders = (newFolders: StorageFolder[]): void => {
  storageStore.setState((state) => {
    const existingIds = new Set(state.folders.map((folder) => folder.id))
    const uniqueFolders = newFolders.filter(
      (folder) => !existingIds.has(folder.id),
    )
    return { ...state, folders: [...state.folders, ...uniqueFolders] }
  })
}

export const setBreadcrumbs = (breadcrumbs: BreadcrumbItem[]): void => {
  storageStore.setState((state) => ({ ...state, breadcrumbs }))
}

export const setQuota = (quota: UserQuota | null): void => {
  storageStore.setState((state) => ({ ...state, quota }))
}

export const setTinySessionPermission = (
  permission: 'read' | 'read-write' | undefined,
): void => {
  storageStore.setState((state) => ({ ...state, tinySessionPermission: permission }))
}

export const setIsNavigating = (isNavigating: boolean): void => {
  storageStore.setState((state) => ({ ...state, isNavigating }))
}

const getSnapshot = (state: StorageState): StorageSnapshot => ({
  ...state,
  setUserId,
  setCurrentFolderId,
  setItems,
  appendItems,
  updateItem,
  removeItems,
  prependItem,
  setFolders,
  appendFolders,
  setBreadcrumbs,
  setQuota,
  setTinySessionPermission,
  setIsNavigating,
})

type UseStorageStore = {
  (): StorageSnapshot
  <T>(selector: (state: StorageSnapshot) => T): T
  getState: () => StorageSnapshot
}

export const useStorageStore = ((selector?: (state: StorageSnapshot) => unknown) =>
  useStore(storageStore, (state) => {
    const snapshot = getSnapshot(state)
    return selector ? selector(snapshot) : snapshot
  })) as UseStorageStore

useStorageStore.getState = () => getSnapshot(storageStore.state)
