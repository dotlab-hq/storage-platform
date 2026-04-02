import { db } from "@/db"
import { file } from "@/db/schema/storage"
import type { BucketContext } from "@/lib/s3-gateway/s3-context"
import { and, eq } from "drizzle-orm"
import { buildUpstreamObjectKey } from "./upload-key-utils"

export type StoredObject = {
    objectKey: string
    providerId: string | null
    mimeType: string | null
    sizeInBytes: number
}

export async function findStoredObject( bucket: BucketContext, objectKey: string ): Promise<StoredObject | null> {
    const upstreamKey = buildUpstreamObjectKey( bucket.userId, bucket.bucketId, objectKey )
    const rows = await db
        .select( {
            objectKey: file.objectKey,
            providerId: file.providerId,
            mimeType: file.mimeType,
            sizeInBytes: file.sizeInBytes,
        } )
        .from( file )
        .where( and( eq( file.userId, bucket.userId ), eq( file.objectKey, upstreamKey ), eq( file.isDeleted, false ) ) )
        .limit( 1 )

    return rows[0] ?? null
}
