export type StorageFile = {
    id: string
    name: string
    objectKey: string
    mimeType: string | null
    sizeInBytes: number
    userId: string
    folderId: string | null
    createdAt: Date
    updatedAt: Date
    isShared?: boolean
    isDeleted?: boolean
    deletedAt?: Date | null
}

export type StorageFolder = {
    id: string
    name: string
    userId: string
    parentFolderId: string | null
    createdAt: Date
    updatedAt: Date
}

export type StorageItem =
    | ( StorageFile & { type: "file" } )
    | ( StorageFolder & { type: "folder" } )

export type UploadingFile = {
    id: string
    file: File
    progress: number
    status: "uploading" | "completed" | "failed"
    error?: string
}

export type UserQuota = {
    usedStorage: number
    allocatedStorage: number
    fileSizeLimit: number
}

export type ShareLinkInfo = {
    id: string
    fileId: string | null
    folderId: string | null
    sharedByUserId: string
    shareToken: string
    isActive: boolean
    expiresAt: Date | null
    createdAt: Date
}

export type ContextMenuAction =
    | "rename"
    | "move"
    | "share"
    | "copy-link"
    | "delete"
    | "download"
    | "open"
    | "restore"
    | "delete-permanent"

export type BreadcrumbItem = {
    id: string | null
    name: string
    path: string
}
