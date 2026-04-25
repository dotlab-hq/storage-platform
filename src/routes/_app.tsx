import { createFileRoute } from '@tanstack/react-router'
import { createFileRoute, Outlet } from '@tanstack/react-start'
import { RootLayout } from '@/lib/providers.tsx/RootProvider'

// This is a TanStack Router route group layout.
// The `_` prefix groups routes under a shared layout without affecting the URL.
export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

function AppLayout() {
  return (
    <RootLayout>
      <Outlet />
    </RootLayout>
  )
}
