import { createFileRoute, Outlet } from '@tanstack/react-router'
import { RootLayout } from '@/lib/providers.tsx/RootProvider'

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
