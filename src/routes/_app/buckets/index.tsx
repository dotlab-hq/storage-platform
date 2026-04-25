import { createFileRoute } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-start'
import { lazy, Suspense } from 'react'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { isAuthenticatedMiddleware } from '@/middlewares/isAuthenticated'
import { PageSkeleton } from '@/components/ui/page-skeleton'

const BucketManager = lazy(() =>
  import('@/components/storage/bucket-manager').then((m) => ({
    default: m.BucketManager,
  })),
)

export const Route = createFileRoute('/_app/buckets/')({
  server: {
    middleware: [isAuthenticatedMiddleware],
  },
  component: BucketsPage,
})

function BucketsPage() {
  return (
    <SidebarInset>
      <header className="flex h-14 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-sm font-semibold">Buckets</h1>
      </header>
      <div className="p-4">
        <Suspense
          fallback={<PageSkeleton className="mb-2" variant="default" />}
        >
          <BucketManager />
        </Suspense>
      </div>
    </SidebarInset>
  )
}
