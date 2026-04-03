import { createServerFn } from "@tanstack/react-start"
import { getAuthenticatedUser } from "@/lib/server-auth"

export const getUserQuotaSnapshotFn = createServerFn( { method: "GET" } )
    .handler( async () => {
        const currentUser = await getAuthenticatedUser()
        const { getUserQuotaSnapshotByUserId } = await import( "./quota.server" )
        return getUserQuotaSnapshotByUserId( currentUser.id )
    } )
