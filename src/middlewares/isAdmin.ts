import { redirect } from '@tanstack/react-router'
import { createMiddleware } from '@tanstack/react-start'
import { resolveSession } from '@/lib/auth/resolve-session'

/** Page/server-fn middleware: signed-in admins only (others get a 404). */
export const isAdminMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const resolved = await resolveSession(request.headers)
    if (!resolved) throw redirect({ to: '/auth' })
    if (!resolved.user.isAdmin) {
      throw Response.json({ error: 'Admin access required' }, { status: 404 })
    }
    return next({ context: resolved })
  },
)
