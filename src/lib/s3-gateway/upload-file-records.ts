import { db } from "@/db"
import { file } from "@/db/schema/storage"
import { and, eq } from "drizzle-orm"

export type CompletedUpload = {
    id: string
    name: string
    objectKey: string
    sizeInBytes: number
    providerId: string | null
    etag: string | null
    cacheControl: string | null
    lastModified: Date | null
}

export async function findCommittedFile( userId: string, upstreamObjectKey: string ): Promise<CompletedUpload | null> {
    const rows = await db
        .select( {
            id: file.id,
            name: file.name,
            objectKey: file.objectKey,
            sizeInBytes: file.sizeInBytes,
            providerId: file.providerId,
            etag: file.etag,
            cacheControl: file.cacheControl,
            lastModified: file.lastModified,
        } )
        .from( file )
        .where( and( eq( file.userId, userId ), eq( file.objectKey, upstreamObjectKey ), eq( file.isDeleted, false ) ) )
        .limit( 1 )

    return rows[0] ?? null
}

export async function upsertCommittedFile( input: {
    userId: string
    providerId: string | null
    objectKey: string
    contentType: string | null
    mappedFolderId: string | null
    fileName: string
    sizeInBytes: number
    etag?: string | null
    cacheControl?: string | null
    lastModified?: Date | null
} ): Promise<CompletedUpload> {
    const existing = await findCommittedFile( input.userId, input.objectKey )

    if ( existing ) {
        const updatedRows = await db
            .update( file )
            .set( {
                name: input.fileName,
                sizeInBytes: input.sizeInBytes,
                mimeType: input.contentType,
                providerId: input.providerId,
                folderId: input.mappedFolderId,
                etag: input.etag ?? null,
                cacheControl: input.cacheControl ?? null,
                lastModified: input.lastModified ?? null,
                isDeleted: false,
                deletedAt: null,
            } )
            .where( eq( file.id, existing.id ) )
            .returning( {
                id: file.id,
                name: file.name,
                objectKey: file.objectKey,
                sizeInBytes: file.sizeInBytes,
                providerId: file.providerId,
                etag: file.etag,
                cacheControl: file.cacheControl,
                lastModified: file.lastModified,
            } )
        return updatedRows[0]
    }

    const insertedRows = await db
        .insert( file )
        .values( {
            userId: input.userId,
            name: input.fileName,
            objectKey: input.objectKey,
            sizeInBytes: input.sizeInBytes,
            mimeType: input.contentType,
            providerId: input.providerId,
            folderId: input.mappedFolderId,
            etag: input.etag ?? null,
            cacheControl: input.cacheControl ?? null,
            lastModified: input.lastModified ?? null,
            isDeleted: false,
        } )
        .returning( {
            id: file.id,
            name: file.name,
            objectKey: file.objectKey,
            sizeInBytes: file.sizeInBytes,
            providerId: file.providerId,
            etag: file.etag,
            cacheControl: file.cacheControl,
            lastModified: file.lastModified,
        } )

    return insertedRows[0]
}
