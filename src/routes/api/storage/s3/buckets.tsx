import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { getAuthenticatedUser } from "@/lib/server-auth"
import { createVirtualBucket, listVirtualBuckets } from "@/lib/s3-gateway/virtual-buckets"

const CreateBucketSchema = z.object( {
    bucketName: z
        .string()
        .trim()
        .min( 3 )
        .max( 63 )
        .regex( /^[a-z0-9][a-z0-9.-]+[a-z0-9]$/, "Invalid bucket name" ),
} )

function errorToMessage( error: unknown, fallback: string ): string {
    if ( error instanceof z.ZodError ) {
        return error.issues[0]?.message ?? fallback
    }
    if ( error instanceof Error ) {
        return error.message
    }
    return fallback
}

export const Route = createFileRoute( "/api/storage/s3/buckets" as never )( {
    component: () => null,
    server: {
        handlers: {
            GET: async () => {
                try {
                    const currentUser = await getAuthenticatedUser()
                    const buckets = await listVirtualBuckets( currentUser.id )
                    return Response.json( { buckets } )
                } catch ( error ) {
                    return Response.json( { error: errorToMessage( error, "Failed to list buckets" ) }, { status: 500 } )
                }
            },
            POST: async ( { request } ) => {
                try {
                    const currentUser = await getAuthenticatedUser()
                    const payload = CreateBucketSchema.parse( await request.json() )
                    const bucket = await createVirtualBucket( currentUser.id, payload.bucketName )
                    return Response.json( { ok: true, bucket } )
                } catch ( error ) {
                    const status = error instanceof z.ZodError ? 400 : 500
                    return Response.json( { ok: false, error: errorToMessage( error, "Failed to create bucket" ) }, { status } )
                }
            },
        },
    },
} )
