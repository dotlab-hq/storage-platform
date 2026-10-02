import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppLayout } from '@/components/app/app-layout'
import { currentUserQuery } from '@/lib/auth/current-user'
import { quotaQuery } from '@/lib/storage/folder-query'

/**
 * Layout for every signed-in page (the `_` prefix means it adds no URL
 * segment). It guarantees a signed-in user for all child routes, on both
 * SSR and client-side navigation.
 */
export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context: { queryClient }, location }) => {
    const user = await queryClient.ensureQueryData(currentUserQuery())
    if (!user) {
      throw redirect({ to: '/auth', search: { redirect: location.href } })
    }
    return { user }
  },
  // Quota is shown in the sidebar on every page.
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(quotaQuery()),
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
})
