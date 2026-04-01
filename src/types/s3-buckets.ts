export type S3BucketItem = {
    name: string
    createdAt: string | null
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
