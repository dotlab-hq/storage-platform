import { createFileRoute } from "@tanstack/react-router"
import { getAuthAwareStatus, requireSessionUser } from "@/lib/auth-guard"

const BUCKET_NAME = "dot-storage"

export const Route = createFileRoute( "/api/storage/upload-presign" )( {
    component: () => null,
    server: {
        handlers: {
            POST: async ( { request } ) => {
                try {
                    const body = ( await request.json() ) as {
                        objectKey?: string
                        contentType?: string
                        fileSize?: number
                    }
                    await requireSessionUser( request )
                    if ( !body.objectKey || typeof body.objectKey !== "string" ) {
                        return Response.json( { error: "Missing objectKey" }, { status: 400 } )
                    }
                    if ( !body.contentType || typeof body.contentType !== "string" ) {
                        return Response.json( { error: "Missing contentType" }, { status: 400 } )
                    }
                    if ( typeof body.fileSize !== "number" || body.fileSize <= 0 ) {
                        return Response.json( { error: "Invalid fileSize" }, { status: 400 } )
                    }

                    const { PutObjectCommand, S3Client } = await import( "@aws-sdk/client-s3" )
                    const { getSignedUrl } = await import( "@aws-sdk/s3-request-presigner" )

                    const s3Client = new S3Client( {
                        region: process.env.S3_REGION,
                        endpoint: process.env.S3_ENDPOINT,
                        forcePathStyle: true,
                        bucketEndpoint: false,
                        credentials: {
                            accessKeyId: process.env.S3_ACCESS_KEY_ID!,
                            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
                        },
                    } )

                    const command = new PutObjectCommand( {
                        Bucket: BUCKET_NAME,
                        Key: body.objectKey,
                        ContentType: body.contentType,
                        ContentLength: body.fileSize,
                    } )

                    const presignedUrl = await getSignedUrl( s3Client, command, { expiresIn: 3600 } )

                    return Response.json( { presignedUrl } )
                } catch ( error ) {
                    console.error( "[Server] Upload presign error:", error )
                    const msg = error instanceof Error ? error.message : String( error )
                    return Response.json( { error: msg }, { status: getAuthAwareStatus( error ) } )
                }
            },
        },
    },
} )
