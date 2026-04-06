import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { createServerOnlyFn } from '@tanstack/react-start'
import { requireAuthenticatedServerOnlySession } from '@/lib/server-auth'

const BUCKET_NAME = 'dot-storage'

const s3Client = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  bucketEndpoint: false,

  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
})

export const saveFileToS3 = createServerOnlyFn(
  async (file: File, key: string) => {
    await requireAuthenticatedServerOnlySession()
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: file.type,
    })

    await s3Client.send(command)
  },
)

export const getFileFromS3 = createServerOnlyFn(async (key: string) => {
  await requireAuthenticatedServerOnlySession()
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  const response = await s3Client.send(command)
  return response.Body
})

export const deleteFileFromS3 = createServerOnlyFn(async (key: string) => {
  await requireAuthenticatedServerOnlySession()
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  await s3Client.send(command)
})
