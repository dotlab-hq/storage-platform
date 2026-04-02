import type { StorageFolder, StorageItem, BreadcrumbItem } from "@/types/storage"

export type RawFolder = {
    id: string
    name: string
    createdAt: string
    parentFolderId: string | null
    isPrivatelyLocked?: boolean
}

export type RawFile = {
    id: string
    name: string
    sizeInBytes: number
    mimeType?: string | null
    objectKey?: string
    createdAt: string
    isPrivatelyLocked?: boolean
}

export type FetchResponse = {
    folders?: RawFolder[]
    files?: RawFile[]
    breadcrumbs?: { id: string; name: string }[]
    error?: string
}

export function mapItems( data: FetchResponse, uid: string ) {
    const folderItems: StorageItem[] = ( data.folders ?? [] ).map( ( folder ) => ( {
        ...folder,
        type: "folder" as const,
        userId: uid,
        parentFolderId: folder.parentFolderId ?? null,
        createdAt: new Date( folder.createdAt ),
        updatedAt: new Date( folder.createdAt ),
        isPrivatelyLocked: Boolean( folder.isPrivatelyLocked ),
    } ) )
    const fileItems: StorageItem[] = ( data.files ?? [] ).map( ( file ) => ( {
        ...file,
        type: "file" as const,
        objectKey: file.objectKey ?? "",
        mimeType: file.mimeType ?? null,
        userId: uid,
        folderId: null,
        createdAt: new Date( file.createdAt ),
        updatedAt: new Date( file.createdAt ),
        isPrivatelyLocked: Boolean( file.isPrivatelyLocked ),
    } ) )
    const folders: StorageFolder[] = ( data.folders ?? [] ).map( ( folder ) => ( {
        ...folder,
        userId: uid,
        parentFolderId: folder.parentFolderId ?? null,
        createdAt: new Date( folder.createdAt ),
        updatedAt: new Date( folder.createdAt ),
        isPrivatelyLocked: Boolean( folder.isPrivatelyLocked ),
    } ) )
    return { items: [...folderItems, ...fileItems], folders }
}

export function mapBreadcrumbs( breadcrumbs: { id: string; name: string }[] ): BreadcrumbItem[] {
    return breadcrumbs.map( ( breadcrumb ) => ( {
        id: breadcrumb.id,
        name: breadcrumb.name,
        path: "",
    } ) )
}