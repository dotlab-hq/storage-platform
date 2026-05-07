// @ts-nocheck
// the middleware will always ensure that the user is not authenticated before allowing access further

import { auth } from '@/lib/auth'
import { redirect } from '@tanstack/react-router'
import { createMiddleware } from '@tanstack/react-start'

const isNotAuthenticatedMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const headers = request.headers
    const session = await auth.api.getSession({ headers })
    if (session) {
      throw redirect({
        to: '/_app',
      })
    }
    //  add the session info to context, so that it can be accessed in the next middlewares or in the server functions
    return next()
  },
)

export { isNotAuthenticatedMiddleware }
