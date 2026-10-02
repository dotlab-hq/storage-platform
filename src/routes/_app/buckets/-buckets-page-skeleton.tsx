import { PageHeader } from '@/components/app/page-header'
import { BucketManagerIntro } from '@/components/storage/bucket-manager'
import { SidebarInset } from '@/components/ui/sidebar'

function Block({ className }: { className: string }) {
  return <div className={`bg-muted/50 animate-pulse rounded-md ${className}`} />
}

/** Same layout as the buckets page, so swapping it in causes no jump. */
export function BucketsPageSkeleton() {
  return (
    <SidebarInset>
      <PageHeader title="Buckets" />
      <div className="p-4">
        <section className="space-y-5">
          <BucketManagerIntro />
          <Block className="h-[3.75rem] rounded-xl lg:h-14" />
          <div className="grid gap-2 md:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Block key={index} className="h-[4.75rem] rounded-lg" />
            ))}
          </div>
          <div className="space-y-px overflow-hidden rounded-lg border border-border/60">
            <Block className="h-10 rounded-none" />
            {Array.from({ length: 4 }, (_, index) => (
              <Block key={index} className="h-[3.75rem] rounded-none" />
            ))}
          </div>
        </section>
      </div>
    </SidebarInset>
  )
}
