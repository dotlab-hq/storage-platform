import {
  ErrorComponent,
  type ErrorComponentProps,
} from '@tanstack/react-router'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AppErrorBoundary({ error, reset }: ErrorComponentProps) {
  const isDev = import.meta.env.DEV
  const message =
    error instanceof Error ? error.message : 'An unexpected error occurred'

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="bg-destructive/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
          <AlertTriangle className="text-destructive h-8 w-8" />
        </div>

        <h1 className="text-foreground mb-2 text-2xl font-bold">
          Something went wrong
        </h1>
        <p className="text-muted-foreground mb-6 text-sm">{message}</p>

        {isDev && error instanceof Error && error.stack && (
          <pre className="bg-muted mb-6 max-h-40 overflow-auto rounded-lg p-3 text-left text-xs">
            {error.stack}
          </pre>
        )}

        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/')}
          >
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  )
}

export function DefaultErrorBoundary(props: ErrorComponentProps) {
  return <ErrorComponent {...props} />
}
