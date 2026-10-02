import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/app/page-header'
import { BucketManager } from '@/components/storage/bucket-manager'
import { SidebarInset } from '@/components/ui/sidebar'
import { bucketsQuery } from '@/lib/s3-buckets/queries'
import { isAuthenticatedMiddleware } from '@/middlewares/isAuthenticated'
import { BucketsPageSkeleton } from './-buckets-page-skeleton'

export const Route = createFileRoute('/_app/buckets/')({
  server: {
    middleware: [isAuthenticatedMiddleware],
  },
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(bucketsQuery()),
  pendingComponent: BucketsPageSkeleton,
  component: BucketsPage,
})

/** /buckets: the user's virtual S3 buckets. */
function BucketsPage() {
  return (
    <SidebarInset>
      <PageHeader title="Buckets" />
      <div className="p-4">
        <BucketManager />
      </div>
    </SidebarInset>
  )
}
