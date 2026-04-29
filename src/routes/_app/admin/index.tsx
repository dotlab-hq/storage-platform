import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { isAdminMiddleware } from '@/middlewares/isAdmin'
import { getAdminDashboardDataFn } from './-components/-admin-server'

function isNotFoundPayload(value: unknown): value is { isNotFound: true } {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const candidate = value as { isNotFound?: unknown }
  return candidate.isNotFound === true
}

const AdminDashboardPage = lazy(() =>
  import('./-components/-admin-page').then((m) => ({
    default: m.AdminDashboardPage,
  })),
)

function AdminRouteComponent() {
  const initial = Route.useLoaderData()
  return (
    <Suspense fallback={<PageSkeleton className="h-full" />}>
      <AdminDashboardPage initial={initial} />
    </Suspense>
  )
}

export const Route = createFileRoute('/_app/admin/')({
  server: {
    middleware: [isAdminMiddleware],
  },
  component: AdminRouteComponent,
  loader: async () => {
    const data = await getAdminDashboardDataFn()
    if (isNotFoundPayload(data)) {
      throw Response.json({ error: 'Admin access required' }, { status: 404 })
    }
    return data
  },
})
