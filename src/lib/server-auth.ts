import { auth } from "@/lib/auth"
import { getRequest } from "@tanstack/react-start/server"
import { notFound, redirect } from "@tanstack/react-router"
import { isAdminRole, normalizeUserRole } from "@/lib/authz"
import type { UserRole } from "@/lib/authz"
import type { user } from "@/db/schema/auth-schema"

type AuthUser = typeof user.$inferSelect
export type AuthenticatedUser = Pick<AuthUser, "id" | "email" | "name"> & {
    role: UserRole
    isAdmin: boolean
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
    try {
        const request = getRequest()
        const headers = request.headers
        const session = await auth.api.getSession( { headers } )
        if ( !session?.user ) {
            throw redirect( { to: "/auth" } )
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
    } catch {
        throw redirect( { to: "/auth" } )
    }
}

export async function requireAdminUser(): Promise<AuthenticatedUser> {
    const currentUser = await getAuthenticatedUser()
    if ( !currentUser.isAdmin ) {
        throw notFound()
    }
    return currentUser
}
