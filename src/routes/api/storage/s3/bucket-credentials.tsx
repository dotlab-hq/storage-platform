import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { getAuthenticatedUser } from "@/lib/server-auth"
import { getVirtualBucketCredentials } from "@/lib/s3-gateway/virtual-buckets"

const BucketActionSchema = z.object( {
    bucketName: z.string().trim().min( 3 ).max( 63 ),
} )

function errorToMessage( error: unknown ): string {
    if ( error instanceof z.ZodError ) {
        return error.issues[0]?.message ?? "Invalid request"
    }
    if ( error instanceof Error ) {
        return error.message
    }
    return "Failed to issue credentials"
}

export const Route = createFileRoute( "/api/storage/s3/bucket-credentials" as never )( {
    component: () => null,
    server: {
        handlers: {
            POST: async ( { request } ) => {
                try {
                    const currentUser = await getAuthenticatedUser()
                    const payload = BucketActionSchema.parse( await request.json() )
                    const credentials = await getVirtualBucketCredentials( currentUser.id, payload.bucketName )
                    return Response.json( { ok: true, credentials } )
                } catch ( error ) {
                    const status = error instanceof z.ZodError ? 400 : 500
                    return Response.json( { ok: false, error: errorToMessage( error ) }, { status } )
                }
            },
        },
    },
} )
