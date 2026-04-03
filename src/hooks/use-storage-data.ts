import { useCallback, useEffect, useRef, useState } from "react"
import { createClientOnlyFn } from "@tanstack/react-start"
import { authClient } from "@/lib/auth-client"
import { DEFAULT_ALLOCATED_STORAGE_BYTES, DEFAULT_FILE_SIZE_LIMIT_BYTES } from "@/lib/storage-quota-constants"
import type { HomeLoaderData } from "@/routes/-home-server"
import { mapBreadcrumbs, mapItems } from "./storage-data-mapper"
import type { FetchResponse } from "./storage-data-mapper"
import type {
    StorageItem,
    StorageFolder,
    UploadingFile,
    UserQuota,
    BreadcrumbItem,
} from "@/types/storage"

const checkAuthClient = createClientOnlyFn( async () => {
    const { data, error } = await authClient.getSession()
    if ( error || !data?.user ) {
        window.location.href = "/auth"
        return null
    }
    return data.user.id
} )

const fetchFolderItems = createClientOnlyFn(
    async ( uid: string, folderId: string | null ) => {
        const params = new URLSearchParams( { userId: uid } )
        if ( folderId ) params.set( "folderId", folderId )
        const res = await fetch( `/api/storage/folder-items?${params}` )
        const data: FetchResponse = await res.json()
        if ( !res.ok ) throw new Error( data.error ?? `HTTP ${res.status}` )
        return data
    }
)

const fetchUserQuota = createClientOnlyFn(
    async ( uid: string ): Promise<UserQuota> => {
        const params = new URLSearchParams( { userId: uid } )
        const res = await fetch( `/api/storage/quota?${params}` )
        const data: {
            usedStorage?: number
            allocatedStorage?: number
            fileSizeLimit?: number
            error?: string
        } = await res.json()
        if ( !res.ok ) throw new Error( data.error ?? `HTTP ${res.status}` )
        return {
            usedStorage: data.usedStorage ?? 0,
            allocatedStorage: data.allocatedStorage ?? DEFAULT_ALLOCATED_STORAGE_BYTES,
            fileSizeLimit: data.fileSizeLimit ?? DEFAULT_FILE_SIZE_LIMIT_BYTES,
        }
    }
)

function mapInitialData( initialData?: HomeLoaderData ) {
    if ( !initialData ) return null

    const mapped = mapItems(
        {
            folders: initialData.folders,
            files: initialData.files,
            breadcrumbs: initialData.breadcrumbs,
        },
        initialData.userId,
    )

    return {
        userId: initialData.userId,
        items: mapped.items,
        folders: mapped.folders,
        breadcrumbs: mapBreadcrumbs( initialData.breadcrumbs ),
        quota: initialData.quota,
    }
}

export function useStorageData( initialData?: HomeLoaderData ) {
    const initialMapped = mapInitialData( initialData )

    const skipFirstLoadRef = useRef( Boolean( initialMapped ) )
    const [userId, setUserId] = useState<string | null>( initialMapped?.userId ?? null )
    const [items, setItems] = useState<StorageItem[]>( initialMapped?.items ?? [] )
    const [folders, setFolders] = useState<StorageFolder[]>( initialMapped?.folders ?? [] )
    const [uploads, setUploads] = useState<UploadingFile[]>( [] )
    const [quota, setQuota] = useState<UserQuota | null>( initialMapped?.quota ?? null )
    const [isLoading, setIsLoading] = useState( !initialMapped )
    const [currentFolderId, setCurrentFolderId] = useState<string | null>( null )
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>( initialMapped?.breadcrumbs ?? [] )

    const loadItems = useCallback(
        async ( uid: string, folderId: string | null ) => {
            setIsLoading( true )
            try {
                const data = await fetchFolderItems( uid, folderId )
                const mapped = mapItems( data, uid )
                setItems( mapped.items )
                setFolders( mapped.folders )
                setBreadcrumbs( mapBreadcrumbs( data.breadcrumbs ?? [] ) )
            } finally {
                setIsLoading( false )
            }
        },
        []
    )

    const loadQuota = useCallback( async ( uid: string ) => {
        try {
            const q = await fetchUserQuota( uid )
            setQuota( q )
        } catch {
            // quota fetch is non-critical; leave as null
        }
    }, [] )

    useEffect( () => {
        if ( initialMapped ) return
        void checkAuthClient().then( async ( uid ) => {
            if ( !uid ) return
            setUserId( uid )
            await loadQuota( uid )
        } )
    }, [initialMapped, loadQuota] )

    useEffect( () => {
        if ( !userId ) return
        if ( skipFirstLoadRef.current ) {
            skipFirstLoadRef.current = false
            return
        }
        void loadItems( userId, currentFolderId )
    }, [currentFolderId, userId, loadItems] )

    const refresh = useCallback( async () => {
        if ( userId ) {
            await Promise.all( [
                loadItems( userId, currentFolderId ),
                loadQuota( userId ),
            ] )
        }
    }, [userId, currentFolderId, loadItems, loadQuota] )

    return {
        userId,
        items,
        setItems,
        folders,
        uploads,
        setUploads,
        quota,
        setQuota,
        isLoading,
        currentFolderId,
        setCurrentFolderId,
        breadcrumbs,
        refresh,
    }
}
