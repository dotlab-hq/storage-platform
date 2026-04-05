import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { db } from "@/db"
import { virtualBucket } from "@/db/schema/s3-gateway"
import { getAuthenticatedUser } from "@/lib/server-auth"
import { and, eq } from "drizzle-orm"
import { getBucketCors, getBucketPolicy, getBucketVersioning, putBucketPolicy, replaceBucketCors, setBucketVersioning } from "@/lib/s3-gateway/s3-bucket-controls"
import { ensureBucketAcl, putBucketAcl } from "@/lib/s3-gateway/s3-acl"

const BucketQuerySchema = z.object( {
    bucketName: z.string().min( 3 ),
} )

const UpdateBucketSchema = z.discriminatedUnion( "action", [
    z.object( { action: z.literal( "versioning" ), bucketName: z.string().min( 3 ), state: z.enum( ["enabled", "suspended", "disabled"] ) } ),
    z.object( { action: z.literal( "policy" ), bucketName: z.string().min( 3 ), policyJson: z.string() } ),
    z.object( {
        action: z.literal( "cors" ), bucketName: z.string().min( 3 ), rules: z.array( z.object( {
            allowedOrigins: z.array( z.string() ),
            allowedMethods: z.array( z.string() ),
            allowedHeaders: z.array( z.string() ),
            exposeHeaders: z.array( z.string() ),
            maxAgeSeconds: z.number().int().nullable(),
        } ) )
    } ),
    z.object( { action: z.literal( "acl" ), bucketName: z.string().min( 3 ), cannedAcl: z.enum( ["private", "public-read"] ) } ),
] )

function toError( error: unknown, fallback: string ): string {
    if ( error instanceof z.ZodError ) return error.issues[0]?.message ?? fallback
    if ( error instanceof Error ) return error.message
    return fallback
}

type LoadedBucket = {
    id: string
    name: string
    region: string
    objectOwnershipMode: string
    blockPublicAccess: boolean
}

async function loadUserBucket( userId: string, bucketName: string ): Promise<LoadedBucket | null> {
    const rows = await db
        .select( {
            id: virtualBucket.id,
            name: virtualBucket.name,
            region: virtualBucket.region,
            objectOwnershipMode: virtualBucket.objectOwnershipMode,
            blockPublicAccess: virtualBucket.blockPublicAccess,
        } )
        .from( virtualBucket )
        .where( and( eq( virtualBucket.userId, userId ), eq( virtualBucket.name, bucketName ), eq( virtualBucket.isActive, true ) ) )
        .limit( 1 )

    const bucket = rows.at( 0 )
    if ( bucket === undefined ) {
        return null
    }
    return bucket
}

export const Route = createFileRoute( "/api/storage/s3/bucket-settings" as never )( {
    component: () => null,
    server: {
        handlers: {
            GET: async ( { request } ) => {
                try {
                    const user = await getAuthenticatedUser()
                    const params = new URL( request.url ).searchParams
                    const parsed = BucketQuerySchema.parse( { bucketName: params.get( "bucketName" ) ?? "" } )
                    const bucket = await loadUserBucket( user.id, parsed.bucketName )
                    if ( bucket === null ) {
                        return Response.json( { error: "Bucket not found" }, { status: 404 } )
                    }

                    const [policy, corsRules, versioning, acl] = await Promise.all( [
                        getBucketPolicy( bucket.id ),
                        getBucketCors( bucket.id ),
                        getBucketVersioning( bucket.id ),
                        ensureBucketAcl( { userId: user.id, bucketId: bucket.id, bucketName: bucket.name, mappedFolderId: null, createdAt: new Date() } ),
                    ] )

                    return Response.json( {
                        bucket,
                        versioning,
                        policyJson: policy?.policyJson ?? "",
                        corsRules,
                        acl: acl.cannedAcl,
                    } )
                } catch ( error ) {
                    return Response.json( { error: toError( error, "Failed to load bucket settings" ) }, { status: 500 } )
                }
            },
            PUT: async ( { request } ) => {
                try {
                    const user = await getAuthenticatedUser()
                    const payload = UpdateBucketSchema.parse( await request.json() )
                    const bucket = await loadUserBucket( user.id, payload.bucketName )
                    if ( bucket === null ) {
                        return Response.json( { error: "Bucket not found" }, { status: 404 } )
                    }

                    if ( payload.action === "versioning" ) {
                        await setBucketVersioning( bucket.id, payload.state )
                    }
                    if ( payload.action === "policy" ) {
                        await putBucketPolicy( bucket.id, payload.policyJson )
                    }
                    if ( payload.action === "cors" ) {
                        await replaceBucketCors( bucket.id, payload.rules )
                    }
                    if ( payload.action === "acl" ) {
                        const headers = new Headers( { "x-amz-acl": payload.cannedAcl } )
                        await putBucketAcl( { userId: user.id, bucketId: bucket.id, bucketName: bucket.name, mappedFolderId: null, createdAt: new Date() }, headers )
                    }

                    return Response.json( { ok: true } )
                } catch ( error ) {
                    return Response.json( { ok: false, error: toError( error, "Failed to update bucket settings" ) }, { status: 500 } )
                }
            },
        },
    },
} )
