import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { verifyExpiredPendingUploads } from "@/lib/s3-gateway/upload-reconciliation"

const CronVerifySchema = z.object( {
    limit: z.number().int().positive().max( 500 ).optional(),
} )

function isCronAuthorized( request: Request ): boolean {
    const configuredSecret = process.env.S3_CRON_VERIFY_SECRET
    if ( !configuredSecret ) return false
    const providedSecret = request.headers.get( "x-cron-secret" )
    if ( !providedSecret ) return false
    return providedSecret === configuredSecret
}

export const Route = createFileRoute( "/api/storage/s3/cron-verify" as never )( {
    component: () => null,
    server: {
        handlers: {
            POST: async ( { request } ) => {
                try {
                    if ( !isCronAuthorized( request ) ) {
                        return Response.json( { error: "Unauthorized cron request" }, { status: 401 } )
                    }
                    const payloadRaw = await request.json().catch( () => ( {} ) )
                    const payload = CronVerifySchema.parse( payloadRaw )
                    const summary = await verifyExpiredPendingUploads( payload.limit )
                    return Response.json( summary )
                } catch ( error ) {
                    const message = error instanceof z.ZodError
                        ? "Invalid cron verify payload"
                        : error instanceof Error
                            ? error.message
                            : "Failed to verify pending uploads"
                    const status = error instanceof z.ZodError ? 400 : 500
                    return Response.json( { error: message }, { status } )
                }
            },
        },
    },
} )
