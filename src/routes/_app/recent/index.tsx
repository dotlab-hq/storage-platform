import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { isAuthenticatedMiddleware } from '@/middlewares/isAuthenticated'

const RecentPage = lazy(() =>
  import('./-recent-page').then((m) => ({
    default: m.RecentPage,
  })),
)

export const Route = createFileRoute('/_app/recent/')({
  server: {
    middleware: [isAuthenticatedMiddleware],
  },
  loader: () => import('./-recent-server').then((m) => m.getRecentSnapshotFn()),
  component: RecentRouteComponent,
})

function RecentRouteComponent() {
  const initial = Route.useLoaderData()
  return (
    <Suspense fallback={<PageSkeleton className="h-full" />}>
      <RecentPage initial={initial} />
    </Suspense>
  )
}
