import { useCallback, useEffect, useState } from "react"
import { createClientOnlyFn } from "@tanstack/react-start"
import { authClient } from "@/lib/auth-client"
import type {
    StorageItem,
    StorageFolder,
    UploadingFile,
    UserQuota,
    BreadcrumbItem,
} from "@/types/storage"

type RawFolder = { id: string; name: string; createdAt: string; parentFolderId: string | null }
type RawFile = {
    id: string
    name: string
    sizeInBytes: number
    mimeType?: string | null
    objectKey?: string
    createdAt: string
}

type FetchResponse = {
    folders?: RawFolder[]
    files?: RawFile[]
    breadcrumbs?: { id: string; name: string }[]
    error?: string
}

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
        const data = ( await res.json() ) as FetchResponse
        if ( !res.ok ) throw new Error( data.error ?? `HTTP ${res.status}` )
        return data
    }
)

function mapItems( data: FetchResponse, uid: string ) {
    const folderItems: StorageItem[] = ( data.folders ?? [] ).map( ( f ) => ( {
        ...f,
        type: "folder" as const,
        userId: uid,
        parentFolderId: f.parentFolderId ?? null,
        createdAt: new Date( f.createdAt ),
        updatedAt: new Date( f.createdAt ),
    } ) )
    const fileItems: StorageItem[] = ( data.files ?? [] ).map( ( f ) => ( {
        ...f,
        type: "file" as const,
        objectKey: f.objectKey ?? "",
        mimeType: f.mimeType ?? null,
        userId: uid,
        folderId: null,
        createdAt: new Date( f.createdAt ),
        updatedAt: new Date( f.createdAt ),
    } ) )
    const folders: StorageFolder[] = ( data.folders ?? [] ).map( ( f ) => ( {
        ...f,
        userId: uid,
        parentFolderId: f.parentFolderId ?? null,
        createdAt: new Date( f.createdAt ),
        updatedAt: new Date( f.createdAt ),
    } ) )
    return { items: [...folderItems, ...fileItems], folders }
}

export function useStorageData() {
    const [userId, setUserId] = useState<string | null>( null )
    const [items, setItems] = useState<StorageItem[]>( [] )
    const [folders, setFolders] = useState<StorageFolder[]>( [] )
    const [uploads, setUploads] = useState<UploadingFile[]>( [] )
    const [quota, setQuota] = useState<UserQuota | null>( null )
    const [isLoading, setIsLoading] = useState( true )
    const [currentFolderId, setCurrentFolderId] = useState<string | null>( null )
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>( [] )

    const loadItems = useCallback(
        async ( uid: string, folderId: string | null ) => {
            setIsLoading( true )
            try {
                const data = await fetchFolderItems( uid, folderId )
                const mapped = mapItems( data, uid )
                setItems( mapped.items )
                setFolders( mapped.folders )
                setBreadcrumbs(
                    ( data.breadcrumbs ?? [] ).map( ( b ) => ( {
                        id: b.id, name: b.name, path: "",
                    } ) )
                )
            } finally {
                setIsLoading( false )
            }
        },
        []
    )

    useEffect( () => {
        void checkAuthClient().then( async ( uid ) => {
            if ( !uid ) return
            setUserId( uid )
            await loadItems( uid, null )
        } )
    }, [] )

    useEffect( () => {
        if ( userId ) void loadItems( userId, currentFolderId )
    }, [currentFolderId, userId, loadItems] )

    const refresh = useCallback( async () => {
        if ( userId ) await loadItems( userId, currentFolderId )
    }, [userId, currentFolderId, loadItems] )

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
