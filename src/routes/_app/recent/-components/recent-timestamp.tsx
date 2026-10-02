import { RelativeTime } from '@/components/ui/relative-time'

/** When an item was last opened, shown as relative time. */
export function RecentTimestamp({ iso }: { iso: string }) {
  return (
    <RelativeTime
      date={iso}
      className="text-muted-foreground shrink-0 text-xs"
    />
  )
}
