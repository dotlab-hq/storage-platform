import { lazy, Suspense } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { isNotAuthenticatedMiddleware } from '@/middlewares/isNotAuthenticated'
import { PageSkeleton } from '@/components/ui/page-skeleton'

const AuthForm = lazy(() =>
  import('@/components/auth/auth-form').then((m) => ({
    default: m.AuthForm,
  })),
)

export const Route = createFileRoute('/auth/')({
  component: RouteComponent,
  server: {
    middleware: [isNotAuthenticatedMiddleware],
  },
})

function RouteComponent() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<PageSkeleton className="h-96 w-full" />}>
          <AuthForm />
        </Suspense>
        <p className="text-muted-foreground mt-4 text-center text-sm">
          Want a tiny session?{' '}
          <Link to="/hot" search={() => ({})} className="text-primary">
            Use scan-based login.
          </Link>
        </p>
      </div>
    </div>
  )
}
