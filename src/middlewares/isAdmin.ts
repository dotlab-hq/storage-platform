// the middleware will always ensure that the user is admin


import { createMiddleware } from '@tanstack/react-start'
import { isAuthenticatedMiddleware } from './isAuthenticated'

const isAdminMiddleware = createMiddleware()
    .middleware( [isAuthenticatedMiddleware] )
    .server( ( { context, next } ) => {
        const user = context.user
        if ( !user.isAdmin ) {
            return new Response( 'Forbidden', { status: 403 } )
        }
        return next();
    } )

export { isAdminMiddleware }