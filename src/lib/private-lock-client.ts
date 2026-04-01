import { createClientOnlyFn } from "@tanstack/react-start"

type PrivateLockResponse = {
    folder?: { id: string; isPrivatelyLocked: boolean }
    error?: string
}

export const setFolderPrivateLockClient = createClientOnlyFn(
    async ( userId: string, folderId: string, isPrivatelyLocked: boolean ) => {
        const res = await fetch( "/api/storage/private-lock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify( { userId, folderId, isPrivatelyLocked } ),
        } )
        const data = ( await res.json() ) as PrivateLockResponse
        if ( !res.ok ) throw new Error( data.error ?? `HTTP ${res.status}` )
        return data.folder
    }
)
