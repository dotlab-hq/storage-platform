import { createServerFn } from "@tanstack/react-start"
import { getUserQuotaSnapshotByUserId } from "@/lib/server-functions/quota"
import { getAuthenticatedUser } from "@/lib/server-auth"
import { listFolderItems } from "@/lib/storage-queries"
import type { UserQuota } from "@/types/storage"

type HomeRawFolder = {
    id: string
    name: string
    createdAt: string
    parentFolderId: string | null
    isPrivatelyLocked?: boolean
}

type HomeRawFile = {
    id: string
    name: string
    sizeInBytes: number
    mimeType?: string | null
    objectKey?: string
    createdAt: string
    isPrivatelyLocked?: boolean
}

export type HomeLoaderData = {
    userId: string
    folders: HomeRawFolder[]
    files: HomeRawFile[]
    breadcrumbs: { id: string; name: string }[]
    quota: UserQuota
}

export const getHomeSnapshotFn = createServerFn( { method: "GET" } )
    .handler( async (): Promise<HomeLoaderData> => {
        const currentUser = await getAuthenticatedUser()
        const [items, quota] = await Promise.all( [
            listFolderItems( currentUser.id, null ),
            getUserQuotaSnapshotByUserId( currentUser.id ),
        ] )

        return {
            userId: currentUser.id,
            folders: items.folders.map( ( folder ) => ( {
                id: folder.id,
                name: folder.name,
                createdAt: folder.createdAt.toISOString(),
                parentFolderId: folder.parentFolderId,
                isPrivatelyLocked: Boolean( folder.isPrivatelyLocked ),
            } ) ),
            files: items.files.map( ( file ) => ( {
                id: file.id,
                name: file.name,
                sizeInBytes: file.sizeInBytes,
                mimeType: file.mimeType,
                objectKey: file.objectKey,
                createdAt: file.createdAt.toISOString(),
                isPrivatelyLocked: Boolean( file.isPrivatelyLocked ),
            } ) ),
            breadcrumbs: [],
            quota,
        }
    } )