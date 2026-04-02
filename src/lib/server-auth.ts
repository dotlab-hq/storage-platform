import { createAuthFromRequest } from "@/lib/auth"
import { getRequest } from "@tanstack/react-start/server"
import { isAdminRole, normalizeUserRole } from "@/lib/authz"
import type { UserRole } from "@/lib/authz"
import type { user } from "@/db/schema/auth-schema"

type AuthUser = typeof user.$inferSelect
export type AuthenticatedUser = Pick<AuthUser, "id" | "email" | "name"> & {
    role: UserRole
    isAdmin: boolean
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
    const request = getRequest()
    const headers = request.headers
    const auth = createAuthFromRequest( request )
    const session = await auth.api.getSession( { headers } )
    if ( !session?.user ) {
        throw new Error( "Unauthorized" )
    }
    const role = normalizeUserRole( session.user.role )
    const isAdmin = isAdminRole( role )
    return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role,
        isAdmin,
    }
}

export async function requireAdminUser(): Promise<AuthenticatedUser> {
    const currentUser = await getAuthenticatedUser()
    if ( !currentUser.isAdmin ) {
        throw new Error( "Forbidden: admin access required" )
    }
    return currentUser
}
