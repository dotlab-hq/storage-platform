// the middleware will always ensure that the user is authenticated before allowing access further


import { auth } from '@/lib/auth'
import { createMiddleware } from '@tanstack/react-start'

const isAuthenticatedMiddleware = createMiddleware().server( async ( { next, request } ) => {
    const headers = request.headers
    const session = await auth.api.getSession( { headers } );
    if ( !session ) {
        return new Response( 'Unauthorized', { status: 401 } )
    }
    //  add the session info to context, so that it can be accessed in the next middlewares or in the server functions
    return next({
        context:{
            session: session.session,
            user: session.user
        }
    })
} )

export { isAuthenticatedMiddleware }