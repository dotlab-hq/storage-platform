import { create } from 'zustand'

/**
 * Which items are selected in the current file view (home grid or trash).
 *
 * The store only holds ids. Callers pass the ordered list of visible ids when
 * an action needs it (shift-click ranges, select all), so the store never
 * holds a stale copy of server data.
 */
type SelectionState = {
  selectedIds: ReadonlySet<string>
  lastSelectedId: string | null

  /** Plain click selects one item; shift-click extends a range. */
  select: (id: string, options?: { range?: boolean; orderedIds?: string[] }) => void
  toggle: (id: string) => void
  selectMany: (ids: string[], append?: boolean) => void
  selectAll: (orderedIds: string[]) => void
  /** Drops ids that are no longer visible (e.g. after a delete or refetch). */
  retain: (visibleIds: string[]) => void
  clear: () => void
}

const EMPTY: ReadonlySet<string> = new Set()

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selectedIds: EMPTY,
  lastSelectedId: null,

  select: (id, options) => {
    const { lastSelectedId, selectedIds } = get()
    const orderedIds = options?.orderedIds ?? []
    if (options?.range && lastSelectedId) {
      const from = orderedIds.indexOf(lastSelectedId)
      const to = orderedIds.indexOf(id)
      if (from !== -1 && to !== -1) {
        const [start, end] = from < to ? [from, to] : [to, from]
        const next = new Set(selectedIds)
        orderedIds.slice(start, end + 1).forEach((rangeId) => next.add(rangeId))
        set({ selectedIds: next, lastSelectedId: id })
        return
      }
    }
    set({ selectedIds: new Set([id]), lastSelectedId: id })
  },

  toggle: (id) => {
    const next = new Set(get().selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    set({ selectedIds: next, lastSelectedId: id })
  },

  selectMany: (ids, append = false) => {
    const next = new Set(append ? get().selectedIds : EMPTY)
    ids.forEach((id) => next.add(id))
    set({
      selectedIds: next,
      lastSelectedId: ids.at(-1) ?? (append ? get().lastSelectedId : null),
    })
  },

  selectAll: (orderedIds) =>
    set({ selectedIds: new Set(orderedIds), lastSelectedId: orderedIds.at(-1) ?? null }),

  retain: (visibleIds) => {
    const { selectedIds } = get()
    if (selectedIds.size === 0) return
    const visible = new Set(visibleIds)
    const next = new Set([...selectedIds].filter((id) => visible.has(id)))
    if (next.size !== selectedIds.size) set({ selectedIds: next })
  },

  clear: () => {
    if (get().selectedIds.size === 0) return
    set({ selectedIds: EMPTY, lastSelectedId: null })
  },
}))

/** True while at least one item is selected (used to hide the dock). */
export const useHasSelection = () =>
  useSelectionStore((state) => state.selectedIds.size > 0)
