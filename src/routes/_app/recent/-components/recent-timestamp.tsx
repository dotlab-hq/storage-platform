import { useSyncExternalStore } from 'react'
import { formatRelativeTime } from '@/lib/file-utils'

const noopSubscribe = () => () => {}

/** False while hydrating server HTML, true afterwards (and on client navigations). */
function useIsHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
}

/**
 * Shows "5m ago"-style time. Relative time depends on the clock and locale,
 * so the server (and the hydration pass) render the stable ISO date instead.
 */
export function RecentTimestamp({ iso }: { iso: string }) {
  const hydrated = useIsHydrated()
  return (
    <time dateTime={iso} className="text-muted-foreground shrink-0 text-xs">
      {hydrated ? formatRelativeTime(new Date(iso)) : iso.slice(0, 10)}
    </time>
  )
}
