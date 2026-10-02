import { createFileRoute, Link } from '@tanstack/react-router'
import { isNotAuthenticatedMiddleware } from '@/middlewares/isNotAuthenticated'
import { AuthForm } from '@/components/auth/auth-form'

/** Only same-site paths are accepted, to avoid open redirects. */
function safeRedirect(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  return value.startsWith('/') && !value.startsWith('//') ? value : undefined
}

export const Route = createFileRoute('/auth/')({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: safeRedirect(search.redirect),
  }),
  server: {
    middleware: [isNotAuthenticatedMiddleware],
  },
  component: AuthPage,
})

function AuthPage() {
  const { redirect } = Route.useSearch()
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <AuthForm redirectTo={redirect} />
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
