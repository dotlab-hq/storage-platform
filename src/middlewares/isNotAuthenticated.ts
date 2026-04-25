// the middleware will always ensure that the user is not authenticated before allowing access further

import { loadAuth } from '@/lib/auth-loader'
import { createMiddleware, redirect } from '@tanstack/react-start'

const isNotAuthenticatedMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const headers = request.headers
    const auth = await loadAuth()
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
