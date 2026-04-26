import { createFileRoute } from '@tanstack/react-router'
import { isAuthenticatedMiddleware } from '@/middlewares/isAuthenticated'
import { lazy, Suspense } from 'react'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { HomeRoutePending } from '../-home-pending'

type GetHomeSnapshotFn = typeof import('../-home-server').getHomeSnapshotFn

type HomeSearch = {
  upload?: boolean
  nav?: string
}

function parseUploadSearchValue(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value
  if (typeof value !== 'string') return undefined
  const normalized = value.trim().toLowerCase()
  if (normalized === '1' || normalized === 'true') return true
  if (normalized === '0' || normalized === 'false') return false
  return undefined
}

function validateHomeSearch(search: Record<string, unknown>): HomeSearch {
  return {
    upload: parseUploadSearchValue(search.upload),
    nav: typeof search.nav === 'string' ? search.nav : undefined,
  }
}

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
  validateSearch: validateHomeSearch,
  loaderDeps: ({ search }) => ({
    upload: search.upload ?? false,
  }),
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
