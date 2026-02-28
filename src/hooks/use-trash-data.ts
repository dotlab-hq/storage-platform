import { useCallback, useEffect, useState } from "react"
import { createClientOnlyFn } from "@tanstack/react-start"
import { authClient } from "@/lib/auth-client"
import { toast } from "@/components/ui/sonner"
import type { TrashItem } from "@/lib/trash-queries"

type TrashResponse = { items?: TrashItem[]; error?: string }

const checkAuthClient = createClientOnlyFn( async () => {
    const { data, error } = await authClient.getSession()
    if ( error || !data?.user ) {
        window.location.href = "/auth"
        return null
    }
    return data.user.id
} )

const fetchTrashItems = createClientOnlyFn( async ( userId: string ) => {
    const params = new URLSearchParams( { userId } )
    const res = await fetch( `/api/storage/trash?${params}` )
    const data = ( await res.json() ) as TrashResponse
    if ( !res.ok ) throw new Error( data.error ?? `HTTP ${res.status}` )
    return data.items ?? []
} )

const restoreOnClient = createClientOnlyFn(
    async ( userId: string, ids: string[], types: ( "file" | "folder" )[] ) => {
        const res = await fetch( "/api/storage/trash-restore", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify( { userId, itemIds: ids, itemTypes: types } ),
        } )
        if ( !res.ok ) {
            const data = ( await res.json().catch( () => ( {} ) ) ) as { error?: string }
            throw new Error( data.error ?? `Restore failed (${res.status})` )
        }
    }
)

const permanentDeleteOnClient = createClientOnlyFn(
    async ( userId: string, ids: string[], types: ( "file" | "folder" )[] ) => {
        const res = await fetch( "/api/storage/trash-delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify( { userId, itemIds: ids, itemTypes: types } ),
        } )
        if ( !res.ok ) {
            const data = ( await res.json().catch( () => ( {} ) ) ) as { error?: string }
            throw new Error( data.error ?? `Delete failed (${res.status})` )
        }
    }
)

export function useTrashData() {
    const [userId, setUserId] = useState<string | null>( null )
    const [items, setItems] = useState<TrashItem[]>( [] )
    const [isLoading, setIsLoading] = useState( true )

    const loadItems = useCallback( async ( uid: string ) => {
        setIsLoading( true )
        try {
            const data = await fetchTrashItems( uid )
            setItems( data )
        } finally {
            setIsLoading( false )
        }
    }, [] )

    useEffect( () => {
        void checkAuthClient().then( async ( uid ) => {
            if ( !uid ) return
            setUserId( uid )
            await loadItems( uid )
        } )
    }, [] )

    const refresh = useCallback( async () => {
        if ( userId ) await loadItems( userId )
    }, [userId, loadItems] )

    const handleRestore = useCallback( async ( itemIds: string[], itemTypes: ( "file" | "folder" )[] ) => {
        if ( !userId ) return
        // Optimistic update
        setItems( ( prev ) => prev.filter( ( i ) => !itemIds.includes( i.id ) ) )
        try {
            await restoreOnClient( userId, itemIds, itemTypes )
            toast.success( itemIds.length === 1 ? "Item restored" : `${itemIds.length} items restored` )
        } catch ( err ) {
            void refresh()
            toast.error( err instanceof Error ? err.message : "Restore failed" )
        }
    }, [userId, refresh] )

    const handlePermanentDelete = useCallback( async ( itemIds: string[], itemTypes: ( "file" | "folder" )[] ) => {
        if ( !userId ) return
        // Optimistic update
        setItems( ( prev ) => prev.filter( ( i ) => !itemIds.includes( i.id ) ) )
        try {
            await permanentDeleteOnClient( userId, itemIds, itemTypes )
            toast.success( itemIds.length === 1 ? "Permanently deleted" : `${itemIds.length} items deleted` )
        } catch ( err ) {
            void refresh()
            toast.error( err instanceof Error ? err.message : "Delete failed" )
        }
    }, [userId, refresh] )

    return {
        userId,
        items,
        isLoading,
        refresh,
        handleRestore,
        handlePermanentDelete,
    }
}
