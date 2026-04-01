export type S3BucketItem = {
    id: string
    name: string
    mappedFolderId: string | null
    isActive: boolean
    createdAt: string | null
}

export type S3BucketCredentials = {
    accessKeyId: string
    secretAccessKey: string
    bucket: string
}

export type S3BucketListResponse = {
    buckets: S3BucketItem[]
}

export type S3BucketActionResponse = {
    ok: true
    bucket: S3BucketItem
} | {
    ok: false
    error: string
}

export type S3BucketCredentialsResponse = {
    ok: true
    credentials: S3BucketCredentials
} | {
    ok: false
    error: string
}
