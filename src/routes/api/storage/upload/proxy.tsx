import { PutObjectCommand } from '@aws-sdk/client-s3'
import { createFileRoute } from '@tanstack/react-router'
import { Readable } from 'node:stream'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { getProviderClientById } from '@/lib/s3-provider-client'
import {
  assertFileSizeWithinLimit,
  MAX_PROXY_STREAM_UPLOAD_BYTES,
} from '@/lib/upload-target-server'

const ProxyUploadRequestSchema = z.object( {
  objectKey: z.string().min( 1 ),
  providerId: z.string().min( 1 ).nullable(),
  fileSize: z.number().nonnegative(),
  contentType: z.string().min( 1 ),
} )

async function* streamWebChunks(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<Uint8Array> {
  const reader = stream.getReader()
  try {
    for ( ; ; ) {
      const { done, value } = await reader.read()
      if ( done ) {
        return
      }
      if ( value ) {
        yield value
      }
    }
  } finally {
    reader.releaseLock()
  }
}

function toNodeReadable( stream: ReadableStream<Uint8Array> ): Readable {
  return Readable.from( streamWebChunks( stream ) )
}

function parseRequest( request: Request ) {
  const providerIdHeader = request.headers.get( 'x-upload-provider-id' )
  return ProxyUploadRequestSchema.parse( {
    objectKey: request.headers.get( 'x-upload-object-key' ),
    providerId:
      providerIdHeader && providerIdHeader.trim().length > 0
        ? providerIdHeader.trim()
        : null,
    fileSize: Number( request.headers.get( 'x-upload-file-size' ) ),
    contentType: request.headers.get( 'content-type' ),
  } )
}

export const Route = createFileRoute( '/api/storage/upload/proxy' )( {
  server: {
    handlers: {
      POST: async ( { request } ) => {
        try {
          if ( !request.body ) {
            return Response.json(
              { error: 'Upload body is required' },
              { status: 400 },
            )
          }

          const authUser = await getAuthenticatedUser()
          const payload = parseRequest( request )
          await assertFileSizeWithinLimit( authUser.id, payload.fileSize )

          if ( payload.fileSize > MAX_PROXY_STREAM_UPLOAD_BYTES ) {
            return Response.json(
              { error: 'Proxy uploads support files up to 5 GB' },
              { status: 400 },
            )
          }

          const provider = await getProviderClientById( payload.providerId )
          if ( !provider.proxyUploadsEnabled ) {
            return Response.json(
              {
                error:
                  'Proxy uploads are not enabled for this storage provider',
              },
              { status: 400 },
            )
          }

          const result = await provider.client.send(
            new PutObjectCommand( {
              Bucket: provider.bucketName,
              Key: payload.objectKey,
              Body: toNodeReadable( request.body as ReadableStream<Uint8Array> ),
              ContentType: payload.contentType,
              ContentLength: payload.fileSize,
            } ),
            {
              abortSignal: request.signal,
            },
          )

          return Response.json( { ok: true, etag: result.ETag ?? null } )
        } catch ( error ) {
          const message =
            error instanceof z.ZodError
              ? 'Invalid proxy upload request'
              : error instanceof Error
                ? error.message
                : 'Failed to proxy upload file'
          const status = error instanceof z.ZodError ? 400 : 500
          return Response.json( { error: message }, { status } )
        }
      },
    },
  },
} )
