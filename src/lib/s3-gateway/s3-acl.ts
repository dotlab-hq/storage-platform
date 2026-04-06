import { db } from "@/db"
import { bucketAcl, objectAcl } from "@/db/schema/s3-controls"
import { file } from "@/db/schema/storage"
import type { BucketContext } from "@/lib/s3-gateway/s3-context"
import { canonicalIdForUser } from "@/lib/s3-gateway/s3-context"
import { buildUpstreamObjectKey } from "@/lib/s3-gateway/upload-key-utils"
import { and, eq } from "drizzle-orm"

export type CannedAcl = "private" | "public-read"

export type AclGrant = {
    grantee: string
    permission: string
}

function escapeXml( value: string ): string {
    return value.replaceAll( "&", "&amp;" ).replaceAll( "<", "&lt;" ).replaceAll( ">", "&gt;" )
}

function bucketAclXml( ownerCanonicalId: string, cannedAcl: CannedAcl ): string {
    const grants = cannedAcl === "public-read"
        ? `<Grant><Grantee xsi:type="Group"><URI>http://acs.amazonaws.com/groups/global/AllUsers</URI></Grantee><Permission>READ</Permission></Grant>`
        : ""
    return `<?xml version="1.0" encoding="UTF-8"?>\n<AccessControlPolicy xmlns="http://s3.amazonaws.com/doc/2006-03-01/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><Owner><ID>${escapeXml( ownerCanonicalId )}</ID></Owner><AccessControlList>${grants}</AccessControlList></AccessControlPolicy>`
}

function parseCannedAclFromHeaders( headers: Headers ): CannedAcl {
    const raw = headers.get( "x-amz-acl" )?.trim().toLowerCase()
    if ( raw === "public-read" ) {
        return "public-read"
    }
    return "private"
}

export async function ensureBucketAcl( bucket: BucketContext ): Promise<{ ownerCanonicalId: string, cannedAcl: CannedAcl }> {
    const existing = await db
        .select( { ownerCanonicalId: bucketAcl.ownerCanonicalId, cannedAcl: bucketAcl.cannedAcl } )
        .from( bucketAcl )
        .where( eq( bucketAcl.bucketId, bucket.bucketId ) )
        .limit( 1 )

    if ( existing[0] ) {
        return { ownerCanonicalId: existing[0].ownerCanonicalId, cannedAcl: existing[0].cannedAcl as CannedAcl }
    }

    const ownerCanonicalId = canonicalIdForUser( bucket.userId )
    await db.insert( bucketAcl ).values( { bucketId: bucket.bucketId, ownerCanonicalId, cannedAcl: "private" } ).onConflictDoNothing()
    return { ownerCanonicalId, cannedAcl: "private" }
}

export async function getBucketAclXml( bucket: BucketContext ): Promise<string> {
    const acl = await ensureBucketAcl( bucket )
    return bucketAclXml( acl.ownerCanonicalId, acl.cannedAcl )
}

export async function putBucketAcl( bucket: BucketContext, headers: Headers ): Promise<void> {
    const cannedAcl = parseCannedAclFromHeaders( headers )
    const ownerCanonicalId = canonicalIdForUser( bucket.userId )
    await db
        .insert( bucketAcl )
        .values( { bucketId: bucket.bucketId, ownerCanonicalId, cannedAcl } )
        .onConflictDoUpdate( { target: bucketAcl.bucketId, set: { cannedAcl, ownerCanonicalId } } )
}

async function resolveObjectFileId( bucket: BucketContext, objectKey: string ): Promise<string | null> {
    const upstreamKey = buildUpstreamObjectKey( bucket.userId, bucket.bucketId, bucket.mappedFolderId, objectKey )
    const rows = await db
        .select( { id: file.id } )
        .from( file )
        .where( and( eq( file.userId, bucket.userId ), eq( file.objectKey, upstreamKey ) ) )
        .limit( 1 )
    return rows[0]?.id ?? null
}

export async function getObjectAclXml( bucket: BucketContext, objectKey: string ): Promise<string> {
    const fileId = await resolveObjectFileId( bucket, objectKey )
    if ( !fileId ) {
        throw new Error( "NoSuchKey" )
    }

    const rows = await db
        .select( { ownerCanonicalId: objectAcl.ownerCanonicalId, cannedAcl: objectAcl.cannedAcl } )
        .from( objectAcl )
        .where( eq( objectAcl.fileId, fileId ) )
        .limit( 1 )

    if ( !rows[0] ) {
        return bucketAclXml( canonicalIdForUser( bucket.userId ), "private" )
    }

    return bucketAclXml( rows[0].ownerCanonicalId, rows[0].cannedAcl as CannedAcl )
}

export async function putObjectAcl( bucket: BucketContext, objectKey: string, headers: Headers ): Promise<void> {
    const fileId = await resolveObjectFileId( bucket, objectKey )
    if ( !fileId ) {
        throw new Error( "NoSuchKey" )
    }

    const cannedAcl = parseCannedAclFromHeaders( headers )
    const ownerCanonicalId = canonicalIdForUser( bucket.userId )
    await db
        .insert( objectAcl )
        .values( { fileId, ownerCanonicalId, cannedAcl } )
        .onConflictDoUpdate( { target: objectAcl.fileId, set: { cannedAcl, ownerCanonicalId } } )
}

export async function isBucketPublicReadable( bucketId: string ): Promise<boolean> {
    const rows = await db
        .select( { cannedAcl: bucketAcl.cannedAcl } )
        .from( bucketAcl )
        .where( eq( bucketAcl.bucketId, bucketId ) )
        .limit( 1 )
    return rows[0]?.cannedAcl === "public-read"
}

export async function isObjectPublicReadable( bucket: BucketContext, objectKey: string ): Promise<boolean> {
    const fileId = await resolveObjectFileId( bucket, objectKey )
    if ( !fileId ) {
        return false
    }

    const rows = await db
        .select( { cannedAcl: objectAcl.cannedAcl } )
        .from( objectAcl )
        .where( eq( objectAcl.fileId, fileId ) )
        .limit( 1 )

    return rows[0]?.cannedAcl === "public-read"
}
