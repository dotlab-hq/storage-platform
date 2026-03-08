import { useCallback, useEffect, useState } from "react"
import { createClientOnlyFn } from "@tanstack/react-start"
import { authClient } from "@/lib/auth-client"
import type { UserQuota } from "@/types/storage"

const fetchUserQuota = createClientOnlyFn(
    async ( uid: string ): Promise<UserQuota> => {
        const params = new URLSearchParams( { userId: uid } )
        const res = await fetch( `/api/storage/quota?${params}` )
        const data = ( await res.json() ) as {
            usedStorage?: number
            allocatedStorage?: number
            fileSizeLimit?: number
            error?: string
        }
        if ( !res.ok ) throw new Error( data.error ?? `HTTP ${res.status}` )
        return {
            usedStorage: data.usedStorage ?? 0,
            allocatedStorage: data.allocatedStorage ?? 250 * 1024 * 1024,
            fileSizeLimit: data.fileSizeLimit ?? 10 * 1024 * 1024,
        }
    }
)

export function useQuota() {
    const [quota, setQuota] = useState<UserQuota | null>( null )

    const load = useCallback( async () => {
        const { data } = await authClient.getSession()
        if ( !data?.user ) return
        try {
            const q = await fetchUserQuota( data.user.id )
            setQuota( q )
        } catch ( err ) {
            console.error( "[useQuota] Failed to load quota:", err )
        }
    }, [] )

    useEffect( () => { void load() }, [load] )

    return quota
}
