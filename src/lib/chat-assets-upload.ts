import { getVirtualBucketCredentials } from '@/lib/s3-gateway/virtual-buckets.server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { nanoid } from 'nanoid'

export interface UploadedFileMetadata {
  key: string
  name: string
  size: number
  mimeType: string
  url: string
}

/**
 * Upload a file to the user's assets bucket
 */
export async function uploadChatAttachment(
  file: File,
  userId: string,
): Promise<UploadedFileMetadata> {
  // Get or create the assets virtual bucket for this user
  const bucket = await getVirtualBucketCredentials(userId, 'assets')

  // Generate unique object key: chat-uploads/{userId}/{nanoid}_{filename}
  const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const objectKey = `chat-uploads/${userId}/${nanoid()}_${safeFilename}`

  // Create S3 client
  const s3Client = new S3Client({
    region: bucket.region,
    endpoint: bucket.endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: bucket.accessKeyId,
      secretAccessKey: bucket.secretAccessKey,
    },
  })

  // Upload file
  const command = new PutObjectCommand({
    Bucket: bucket.bucket,
    Key: objectKey,
    Body: file,
    ContentType: file.type || 'application/octet-stream',
  })

  await s3Client.send(command)

  // Generate presigned URL for access
  const presignedUrl = `/${bucket.bucket}/${objectKey}`

  return {
    key: objectKey,
    name: file.name,
    size: file.size,
    mimeType: file.type,
    url: presignedUrl,
  }
}

/**
 * Generate a presigned URL for direct client upload
 * (for large files, use multipart upload)
 */
export async function getChatAttachmentUploadUrl(
  userId: string,
  filename: string,
  _mimeType: string,
  _size: number,
): Promise<{ uploadUrl: string; objectKey: string }> {
  const bucket = await getVirtualBucketCredentials(userId, 'assets')
  const objectKey = `chat-uploads/${userId}/${nanoid()}_${filename}`

  // For simplicity, use direct upload URL
  // In production, might use presigned POST or multipart
  const uploadUrl = `/${bucket.bucket}/${objectKey}`

  return {
    uploadUrl,
    objectKey,
  }
}
