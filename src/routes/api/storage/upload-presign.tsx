import { createFileRoute } from "@tanstack/react-router"
import { getAuthenticatedUser } from "@/lib/server-auth"
import { selectProviderForUpload } from "@/lib/s3-provider-client"

export const Route = createFileRoute( "/api/storage/upload-presign" )( {
    component: () => null,
    server: {
        handlers: {
            POST: async ( { request } ) => {
                try {
                    await getAuthenticatedUser()
                    const body = ( await request.json() ) as {
                        objectKey?: string
                        contentType?: string
                        fileSize?: number
                    }

                    if ( !body.objectKey || typeof body.objectKey !== "string" ) {
                        return Response.json( { error: "Missing objectKey" }, { status: 400 } )
                    }
                    if ( !body.contentType || typeof body.contentType !== "string" ) {
                        return Response.json( { error: "Missing contentType" }, { status: 400 } )
                    }
                    if ( typeof body.fileSize !== "number" || body.fileSize <= 0 ) {
                        return Response.json( { error: "Invalid fileSize" }, { status: 400 } )
                    }

                    const { PutObjectCommand } = await import( "@aws-sdk/client-s3" )
                    const { getSignedUrl } = await import( "@aws-sdk/s3-request-presigner" )
                    const provider = await selectProviderForUpload( body.fileSize )

                    const command = new PutObjectCommand( {
                        Bucket: provider.bucketName,
                        Key: body.objectKey,
                        ContentType: body.contentType,
                        // ContentLength: body.fileSize,
                    } )

                    const presignedUrl = await getSignedUrl( provider.client, command, { expiresIn: 3600 } )

                    return Response.json( { presignedUrl, providerId: provider.providerId } )
                } catch ( error ) {
                    console.error( "[Server] Upload presign error:", error )
                    const msg = error instanceof Error ? error.message : String( error )
                    return Response.json( { error: msg }, { status: 500 } )
                }
            },
        },
    },
} )
