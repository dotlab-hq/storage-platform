import { db } from "@/db"
import { objectEncryptionMetadata } from "@/db/schema/s3-security"
import { file } from "@/db/schema/storage"
import type { BucketContext } from "@/lib/s3-gateway/s3-context"
import { buildUpstreamObjectKey } from "@/lib/s3-gateway/upload-key-utils"
import { and, eq } from "drizzle-orm"

export async function persistSseMetadata( bucket: BucketContext, objectKey: string, mode: string | null ): Promise<void> {
    if ( mode !== "AES256" ) {
        return
    }

    const upstreamKey = buildUpstreamObjectKey( bucket.userId, bucket.bucketId, bucket.mappedFolderId, objectKey )
    const files = await db
        .select( { id: file.id } )
        .from( file )
        .where( and( eq( file.userId, bucket.userId ), eq( file.objectKey, upstreamKey ), eq( file.isDeleted, false ) ) )
        .limit( 1 )

    const target = files[0]
    if ( !target ) {
        return
    }

    await db
        .insert( objectEncryptionMetadata )
        .values( { fileId: target.id, mode: "SSE-S3" } )
        .onConflictDoUpdate( {
            target: objectEncryptionMetadata.fileId,
            set: { mode: "SSE-S3", encryptedAt: new Date() },
        } )
}
