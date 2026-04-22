import { AuthForm } from '@/components/auth/auth-form'
import { isNotAuthenticatedMiddleware } from '@/middlewares/isNotAuthenticated'
import { Link, createFileRoute } from '@tanstack/react-router'

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
        <AuthForm />
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
