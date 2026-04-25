import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { isAuthenticatedMiddleware } from '@/middlewares/isAuthenticated'

const TrashPage = lazy(() =>
  import('./-trash-page').then((m) => ({
    default: m.TrashPage,
  })),
)

export const Route = createFileRoute('/_app/trash/')({
  server: {
    middleware: [isAuthenticatedMiddleware],
  },
  component: TrashRouteComponent,
})

function TrashRouteComponent() {
  return (
    <Suspense fallback={<PageSkeleton className="h-full" />}>
      <TrashPage />
    </Suspense>
  )
}
