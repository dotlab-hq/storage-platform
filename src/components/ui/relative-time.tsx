import { useHydrated } from '@/hooks/use-hydrated'
import { formatRelativeTime } from '@/lib/file-utils'
import { cn } from '@/lib/utils'

type RelativeTimeProps = {
  date: Date | string
  className?: string
}

/**
 * "5m ago"-style time. It depends on the current clock and locale, so the
 * server and the hydration pass render the stable `YYYY-MM-DD` date instead
 * (otherwise a minute boundary between the two renders breaks hydration).
 */
export function RelativeTime({ date, className }: RelativeTimeProps) {
  const hydrated = useHydrated()
  const value = typeof date === 'string' ? new Date(date) : date
  const iso = value.toISOString()
  return (
    <time dateTime={iso} className={cn(className)}>
      {hydrated ? formatRelativeTime(value) : iso.slice(0, 10)}
    </time>
  )
}
