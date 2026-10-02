import { SidebarInset } from '@/components/ui/sidebar'
import { PageHeader } from '@/components/app/page-header'
import { TRASH_LIST_CLASS } from '@/components/storage/trash-content'

export function TrashPageSkeleton() {
  return (
    <SidebarInset>
      <PageHeader
        title={<div className="bg-muted h-4 w-24 animate-pulse rounded" />}
        actions={<div className="bg-muted h-8 w-40 animate-pulse rounded-md" />}
      />
      <div className="flex-1 p-4 pt-0">
        <div role="status" aria-label="Loading trash" className={TRASH_LIST_CLASS}>
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="bg-card h-[106px] animate-pulse rounded-lg border" />
          ))}
        </div>
      </div>
    </SidebarInset>
  )
}
