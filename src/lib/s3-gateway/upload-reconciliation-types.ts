export type NormalizedUploadStatus = "uploading" | "ready" | "failed"

export type AttemptRow = {
    id: string
    userId: string
    providerId: string | null
    objectKey: string
    upstreamObjectKey: string
    expectedSize: number
    contentType: string | null
    status: string
    expiresAt: Date
    createdAt: Date
    completedAt: Date | null
    errorMessage: string | null
    lastCheckedAt: Date | null
    nextCheckAfter: Date | null
    mappedFolderId: string | null
}

export type UploadStatusResult = {
    uploadId: string
    status: NormalizedUploadStatus
    internalStatus: "pending" | "uploaded" | "failed"
    objectKey: string
    createdAt: Date
    completedAt: Date | null
    expiresAt: Date
    errorMessage: string | null
    message: string | null
}
