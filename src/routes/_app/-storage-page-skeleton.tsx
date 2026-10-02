import { SidebarInset } from '@/components/ui/sidebar'
import { FileGridSkeleton } from '@/components/storage/file-grid-skeleton'
import { PageHeader } from '@/components/app/page-header'

/** Same layout as the storage page, so swapping it in causes no jump. */
export function StoragePageSkeleton() {
  return (
    <SidebarInset>
      <PageHeader
        title={<div className="bg-muted h-4 w-36 max-w-[42vw] animate-pulse rounded" />}
        actions={<div className="bg-muted size-9 animate-pulse rounded-md" />}
      />
      <div className="flex flex-1 flex-col gap-4 p-2 pt-0 sm:p-4">
        <FileGridSkeleton />
      </div>
    </SidebarInset>
  )
}
