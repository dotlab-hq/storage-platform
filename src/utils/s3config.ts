import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { createServerOnlyFn } from '@tanstack/react-start'
import { requireAuthenticatedServerOnlySession } from '@/lib/server-auth.server'

const BUCKET_NAME = 'dot-storage'

// Validate required env vars
if ( !process.env.S3_REGION ) {
  throw new Error(
    'S3_REGION environment variable is not set. This is required for S3 operations.',
  )
}

const S3_REGION = process.env.S3_REGION.trim()
const REGION_SENTINELS = new Set([ '', 'auto', 'null', 'undefined', 'pending', 'bucket' ])
if ( REGION_SENTINELS.has( S3_REGION.toLowerCase() ) ) {
  throw new Error(
    `S3_REGION value "${S3_REGION}" is not a valid AWS region. Use a real region like "us-east-1" — "auto" causes SigV4 signing failures.`,
  )
}

const s3Client = new S3Client( {
  region: S3_REGION,
  endpoint: process.env.S3_ENDPOINT!,
  forcePathStyle: true,
  bucketEndpoint: false,
  // Disable the SDK's automatic "aws-chunked" content encoding. Some
  // S3-compatible providers (e.g. the one behind storage.wpsadi.dev) reject
  // requests with `Transfer-Encoding: chunked` + `Content-Encoding: aws-chunked`
  // and respond with 503 ServiceUnavailable. Buffering lets the SDK send a
  // plain `Content-Length` header which those providers accept.
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',

  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
} )

export const saveFileToS3 = createServerOnlyFn(
  async ( file: File, key: string ) => {
    await requireAuthenticatedServerOnlySession()
    const command = new PutObjectCommand( {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: file.type,
    } )

    await s3Client.send( command )
  },
)

export const getFileFromS3 = createServerOnlyFn( async ( key: string ) => {
  await requireAuthenticatedServerOnlySession()
  const command = new GetObjectCommand( {
    Bucket: BUCKET_NAME,
    Key: key,
  } )

  const response = await s3Client.send( command )
  return response.Body
} )

export const deleteFileFromS3 = createServerOnlyFn( async ( key: string ) => {
  await requireAuthenticatedServerOnlySession()
  const command = new DeleteObjectCommand( {
    Bucket: BUCKET_NAME,
    Key: key,
  } )

  await s3Client.send( command )
} )
