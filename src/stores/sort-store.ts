import { useStore } from '@tanstack/react-store'
import { Store } from '@tanstack/store'

export type SortField = 'name' | 'createdAt' | 'updatedAt' | 'size'
export type SortOrder = 'asc' | 'desc'

type SortState = {
  field: SortField
  order: SortOrder
}

type SortActions = {
  setField: (field: SortField) => void
  toggleOrder: () => void
}

type SortSnapshot = SortState & SortActions

const STORAGE_KEY = 'sort-storage'
const defaultState: SortState = {
  field: 'name',
  order: 'asc',
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

function parseSortState(raw: string | null): SortState | null {
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as { state?: SortState }
    const state = parsed.state
    if (!state) return null
    if (
      ['name', 'createdAt', 'updatedAt', 'size'].includes(state.field) &&
      ['asc', 'desc'].includes(state.order)
    ) {
      return { field: state.field, order: state.order }
    }
    return null
  } catch {
    return null
  }
}

function readInitialState(): SortState {
  if (!isBrowser()) return defaultState
  return parseSortState(localStorage.getItem(STORAGE_KEY)) ?? defaultState
}

export const sortStore = new Store<SortState>(readInitialState())

export const setField = (field: SortField): void => {
  sortStore.setState((state) => ({ ...state, field }))
}

export const toggleOrder = (): void => {
  sortStore.setState((state) => ({
    ...state,
    order: state.order === 'asc' ? 'desc' : 'asc',
  }))
}

if (isBrowser()) {
  sortStore.subscribe(() => {
    const state = sortStore.state
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state }))
  })
}

const getSnapshot = (state: SortState): SortSnapshot => ({
  ...state,
  setField,
  toggleOrder,
})

export function useSortStore<T>(selector: (state: SortSnapshot) => T): T
export function useSortStore(): SortSnapshot
export function useSortStore<T>(selector?: (state: SortSnapshot) => T) {
  return useStore(sortStore, (state) => {
    const snapshot = getSnapshot(state)
    return selector ? selector(snapshot) : snapshot
  })
}
