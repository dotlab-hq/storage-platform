import { auth } from "@/lib/auth"
import { getRequest } from "@tanstack/react-start/server"
import { user } from "@/db/schema/auth-schema"

type AuthUser = typeof user.$inferSelect
export type AuthenticatedUser = Pick<AuthUser, "id" | "email" | "name" | "isAdmin">

export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
    const request = getRequest()
    const headers = request.headers
    const session = await auth.api.getSession( { headers } )
    if ( !session?.user ) {
        throw new Error( "Unauthorized" )
    }
    return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        isAdmin: Boolean( session.user.isAdmin ),
    }
}

export async function requireAdminUser(): Promise<AuthenticatedUser> {
    const user = await getAuthenticatedUser()
    if ( !user.isAdmin ) {
        throw new Error( "Forbidden: admin access required" )
    }
    return user
}
