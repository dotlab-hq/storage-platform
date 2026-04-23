import { createFileRoute } from '@tanstack/react-router'
import { isAuthenticatedMiddleware } from '@/middlewares/isAuthenticated'
import { lazy, Suspense } from 'react'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { HomeRoutePending } from '../-home-pending'
import { getHomeSnapshotFn } from '../-home-server'

const StoragePage = lazy(() =>
  import('./-storage-page').then((m) => ({ default: m.StoragePage })),
)

export const Route = createFileRoute('/_app/')({
  server: {
    middleware: [isAuthenticatedMiddleware],
  },
  component: StorageRouteComponent,
  loader: () => getHomeSnapshotFn(),
  pendingComponent: HomeRoutePending,
})

function StorageRouteComponent() {
  const search = Route.useSearch()
  const initial = Route.useLoaderData()
  return (
    <Suspense fallback={<PageSkeleton variant="default" />}>
      <StoragePage initial={initial} search={search} />
    </Suspense>
  )
}
