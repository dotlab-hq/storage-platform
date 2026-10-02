import { SidebarInset } from '@/components/ui/sidebar'
import { Tabs } from '@/components/ui/tabs'
import { PageHeader } from '@/components/app/page-header'
import { AdminTabsList } from './admin-tabs'

/** Same layout as the admin page (overview tab), shown while it loads. */
export function AdminPageSkeleton() {
  return (
    <SidebarInset>
      <PageHeader title="Admin Dashboard" />
      <div className="p-4">
        <Tabs value="overview" className="w-full">
          <AdminTabsList />
          <div
            role="status"
            aria-label="Loading admin dashboard"
            className="grid gap-4 md:grid-cols-3"
          >
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="bg-muted h-[88px] animate-pulse rounded-lg"
              />
            ))}
          </div>
        </Tabs>
      </div>
    </SidebarInset>
  )
}
