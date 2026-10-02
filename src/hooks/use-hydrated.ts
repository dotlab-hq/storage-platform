import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/**
 * False during SSR and the hydration render, true afterwards. Use it to
 * render browser-only values (saved theme, localStorage, relative time)
 * without a hydration mismatch, which would make React re-render the page.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}
