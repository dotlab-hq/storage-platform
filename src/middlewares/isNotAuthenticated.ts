// the middleware will always ensure that the user is authenticated before allowing access further


import { loadAuth } from '@/lib/auth-loader'
import { createMiddleware } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'

const isNotAuthenticatedMiddleware = createMiddleware().server( async ( { next, request } ) => {
    const headers = request.headers
    const auth = await loadAuth()
    const session = await auth.api.getSession( { headers } );
    if ( session ) {
        throw redirect( {
            to: "/"
        } )
    }
    //  add the session info to context, so that it can be accessed in the next middlewares or in the server functions
    return next()
} )

export { isNotAuthenticatedMiddleware }