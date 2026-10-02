import { Clock } from 'lucide-react'
import { SidebarInset } from '@/components/ui/sidebar'
import { PageHeader } from '@/components/app/page-header'
import { RECENT_ROW_CLASS } from './recent-page'

/** Placeholder with the same layout as `RecentPage`, shown while its data loads. */
export function RecentPageSkeleton() {
  return (
    <SidebarInset>
      <PageHeader
        title="Recent"
        icon={<Clock className="text-muted-foreground h-4 w-4" />}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div
          role="status"
          aria-label="Loading recent items"
          className="space-y-1"
        >
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className={RECENT_ROW_CLASS}>
              <div className="bg-muted h-4 w-4 shrink-0 animate-pulse rounded" />
              <div className="bg-muted h-4 flex-1 animate-pulse rounded" />
              <div className="bg-muted h-3 w-12 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </SidebarInset>
  )
}
