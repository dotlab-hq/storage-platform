import { createFileRoute } from '@tanstack/react-router'
import { notFound } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { isAdminMiddleware } from '@/middlewares/isAdmin'
import { getAdminDashboardDataFn } from './-admin-server'

function isNotFoundPayload(value: unknown): value is { isNotFound: true } {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const candidate = value as { isNotFound?: unknown }
  return candidate.isNotFound === true
}

const AdminDashboardPage = lazy(() =>
  import('./-admin-page').then((m) => ({
    default: m.AdminDashboardPage,
  })),
)

function AdminRouteComponent() {
  const initial = Route.useLoaderData() as AdminDashboardData | undefined
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
      throw notFound()
    }
    return data
  },
})
