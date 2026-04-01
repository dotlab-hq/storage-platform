import { useCallback, useEffect, useState } from "react"
import { createClientOnlyFn } from "@tanstack/react-start"
import { authClient } from "@/lib/auth-client"
import { DEFAULT_ALLOCATED_STORAGE_BYTES, DEFAULT_FILE_SIZE_LIMIT_BYTES } from "@/lib/storage-quota-constants"
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
            allocatedStorage: data.allocatedStorage ?? DEFAULT_ALLOCATED_STORAGE_BYTES,
            fileSizeLimit: data.fileSizeLimit ?? DEFAULT_FILE_SIZE_LIMIT_BYTES,
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
