import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { getAuthenticatedUser } from "@/lib/server-auth"
import { getUploadStatus } from "@/lib/s3-gateway/upload-attempts"

const UploadStatusQuerySchema = z.object( {
    uploadId: z.string().uuid(),
} )

export const Route = createFileRoute( "/api/storage/s3/upload-status" as never )( {
    component: () => null,
    server: {
        handlers: {
            GET: async ( { request } ) => {
                try {
                    const currentUser = await getAuthenticatedUser()
                    const url = new URL( request.url )
                    const query = UploadStatusQuerySchema.parse( {
                        uploadId: url.searchParams.get( "uploadId" ),
                    } )

                    const status = await getUploadStatus( currentUser.id, query.uploadId )
                    return Response.json( status )
                } catch ( error ) {
                    const message = error instanceof z.ZodError
                        ? "Invalid upload status query"
                        : error instanceof Error
                            ? error.message
                            : "Failed to fetch upload status"
                    const status = error instanceof z.ZodError ? 400 : 500
                    return Response.json( { error: message }, { status } )
                }
            },
        },
    },
} )
