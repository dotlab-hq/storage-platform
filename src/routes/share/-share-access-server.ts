import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import {
    getShareByToken,
    getSharedFolderTreeByToken,
    getSharedFilePresignedUrl,
    getSharedFileDownloadUrl,
} from "@/lib/share-queries"

type FileItem = {
    id: string
    name: string
    mimeType: string | null
    sizeInBytes: number
    objectKey: string
}

type FolderItem = { id: string; name: string }

export type FolderTreePayload = {
    rootFolderId: string
    rootFolderName: string
    folders: { id: string; name: string; parentFolderId: string | null; depth: number }[]
    files: { id: string; name: string; mimeType: string | null; sizeInBytes: number; folderId: string | null }[]
}

export const getShareAccessFn = createServerFn( { method: "GET" } )
    .inputValidator( z.object( { token: z.string() } ) )
    .handler( async ( { data } ) => {
        const result = await getShareByToken( data.token )
        if ( !result ) throw new Error( "Share link not found or expired" )

        if ( result.type === "file" ) {
            const fileItem = result.item as FileItem
            const presignedUrl = await getSharedFilePresignedUrl( fileItem.objectKey, fileItem.name )
            return {
                type: "file" as const,
                name: fileItem.name,
                mimeType: fileItem.mimeType,
                sizeInBytes: fileItem.sizeInBytes,
                presignedUrl,
            }
        }

        const folderItem = result.item as FolderItem
        return { type: "folder" as const, name: folderItem.name, folderId: folderItem.id }
    } )

export const getFolderTreeAccessFn = createServerFn( { method: "GET" } )
    .inputValidator( z.object( { token: z.string() } ) )
    .handler( async ( { data } ) => {
        const result = await getShareByToken( data.token )
        if ( !result || result.type !== "folder" ) {
            throw new Error( "Share link not found or expired" )
        }
        const folderItem = result.item as FolderItem
        const tree = await getSharedFolderTreeByToken( data.token )
        return {
            type: "folder" as const,
            name: folderItem.name,
            folderId: folderItem.id,
            tree,
        }
    } )

export const getShareDownloadUrlFn = createServerFn( { method: "GET" } )
    .inputValidator( z.object( { token: z.string() } ) )
    .handler( async ( { data } ) => {
        const result = await getShareByToken( data.token )
        if ( !result || result.type !== "file" ) {
            throw new Error( "File not found or invalid share link" )
        }
        const fileItem = result.item as FileItem
        const url = await getSharedFileDownloadUrl( fileItem.objectKey, fileItem.name )
        return { url, name: fileItem.name }
    } )
