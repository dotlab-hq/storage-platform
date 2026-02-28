import { useCallback, useState } from "react"
import { createClientOnlyFn } from "@tanstack/react-start"
import { toast } from "@/components/ui/sonner"
import { buildNavUrl } from "@/lib/nav-token"
import type { StorageItem, ContextMenuAction } from "@/types/storage"

type UseStorageActionsParams = {
    userId: string | null
    currentFolderId: string | null
    setItems: React.Dispatch<React.SetStateAction<StorageItem[]>>
    refresh: () => Promise<void>
    setCurrentFolderId: ( id: string | null ) => void
    select: ( id: string, shift: boolean ) => void
    clearSelection: () => void
    selectedIds: Set<string>
    onDeleteOpen: ( item: StorageItem ) => void
    onMoveOpen: () => void
    onShareOpen: ( item: StorageItem ) => void
}

const createFolderOnClient = createClientOnlyFn(
    async ( userId: string, name: string, parentFolderId: string | null ) => {
        const res = await fetch( "/api/storage/create-folder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify( { userId, name, parentFolderId } ),
        } )
        const data = ( await res.json() ) as {
            folder?: { id: string; name: string; createdAt: string }
            error?: string
        }
        if ( !res.ok ) throw new Error( data.error ?? `HTTP ${res.status}` )
        return data.folder!
    }
)

const renameOnClient = createClientOnlyFn(
    async ( userId: string, itemId: string, newName: string, itemType: "file" | "folder" ) => {
        const res = await fetch( "/api/storage/rename", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify( { userId, itemId, newName, itemType } ),
        } )
        const data = ( await res.json() ) as { item?: { id: string; name: string }; error?: string }
        if ( !res.ok ) throw new Error( data.error ?? `HTTP ${res.status}` )
        return data.item!
    }
)

const presignOnClient = createClientOnlyFn(
    async ( userId: string, fileId: string ) => {
        const params = new URLSearchParams( { userId, fileId } )
        const res = await fetch( `/api/storage/presign?${params}` )
        const data = ( await res.json() ) as { url?: string; error?: string }
        if ( !res.ok ) throw new Error( data.error ?? `HTTP ${res.status}` )
        return data.url!
    }
)

export function useStorageActions( params: UseStorageActionsParams ) {
    const {
        userId, currentFolderId, setItems, setCurrentFolderId,
        select, onDeleteOpen, onMoveOpen, onShareOpen,
    } = params

    const [renamingItemId, setRenamingItemId] = useState<string | null>( null )

    const handleDoubleClick = useCallback(
        async ( item: StorageItem ) => {
            if ( item.type === "folder" ) {
                setCurrentFolderId( item.id )
                return
            }
            if ( !userId ) return
            try {
                const url = await presignOnClient( userId, item.id )
                window.open( url, "_blank" )
            } catch ( err ) {
                toast.error( `Failed to open file: ${err instanceof Error ? err.message : "Unknown error"}` )
            }
        },
        [setCurrentFolderId, userId]
    )

    const handleRename = useCallback(
        async ( item: StorageItem, newName: string ) => {
            if ( !userId ) return
            setItems( ( prev ) => prev.map( ( i ) => i.id === item.id ? { ...i, name: newName } : i ) )
            setRenamingItemId( null )
            try {
                await renameOnClient( userId, item.id, newName, item.type )
                toast.success( `Renamed to "${newName}"` )
            } catch ( err ) {
                setItems( ( prev ) => prev.map( ( i ) => i.id === item.id ? { ...i, name: item.name } : i ) )
                toast.error( `Rename failed: ${err instanceof Error ? err.message : "Unknown error"}` )
            }
        },
        [userId, setItems]
    )

    const handleContextAction = useCallback(
        ( action: ContextMenuAction, item: StorageItem ) => {
            switch ( action ) {
                case "open":
                    void handleDoubleClick( item )
                    break
                case "rename":
                    setRenamingItemId( item.id )
                    break
                case "move":
                    select( item.id, false )
                    onMoveOpen()
                    break
                case "share":
                    onShareOpen( item )
                    break
                case "copy-link": {
                    const payload = item.type === "folder"
                        ? { folderId: item.id }
                        : { folderId: currentFolderId, fileId: item.id }
                    const url = buildNavUrl( payload )
                    void navigator.clipboard.writeText( url )
                    toast.success( "Link copied to clipboard" )
                    break
                }
                case "delete":
                    onDeleteOpen( item )
                    break
                case "download":
                    if ( !userId || item.type !== "file" ) return
                    void presignOnClient( userId, item.id ).then( ( url ) => {
                        const a = document.createElement( "a" )
                        a.href = url
                        a.download = item.name
                        a.click()
                    } ).catch( () => toast.error( "Download failed" ) )
                    break
            }
        },
        [handleDoubleClick, select, onMoveOpen, onShareOpen, onDeleteOpen, userId]
    )

    const handleNewFolder = useCallback(
        async ( name: string ) => {
            if ( !userId ) { toast.error( "Session not ready" ); return }
            const created = await createFolderOnClient( userId, name, currentFolderId )
            const newFolder: StorageItem = {
                id: created.id, name: created.name, type: "folder",
                userId, parentFolderId: currentFolderId,
                createdAt: new Date( created.createdAt ),
                updatedAt: new Date( created.createdAt ),
            }
            setItems( ( prev ) => [newFolder, ...prev] )
            toast.success( `Folder "${created.name}" created` )
        },
        [userId, currentFolderId, setItems]
    )

    return {
        handleDoubleClick,
        handleContextAction,
        handleNewFolder,
        handleRename,
        renamingItemId,
        setRenamingItemId,
    }
}
