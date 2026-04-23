import { createFileRoute } from '@tanstack/react-router'
import { isAuthenticatedMiddleware } from '@/middlewares/isAuthenticated'
import { lazy, Suspense } from 'react'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { HomeRoutePending } from '../-home-pending'
import type { GetHomeSnapshotFn } from '../-home-server'

// Lazy-load the server function to keep client bundle small
async function loadGetHomeSnapshotFn(): Promise<GetHomeSnapshotFn> {
  const mod = await import('../-home-server')
  return mod.getHomeSnapshotFn
}

const StoragePage = lazy(() =>
  import('./-storage-page').then((m) => ({ default: m.StoragePage })),
)

export const Route = createFileRoute('/_app/')({
  server: {
    middleware: [isAuthenticatedMiddleware],
  },
  component: StorageRouteComponent,
  loader: async () => {
    const fn = await loadGetHomeSnapshotFn()
    return fn()
  },
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
