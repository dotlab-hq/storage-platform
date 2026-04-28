import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createServerFn } from '@tanstack/react-start'
import { getViewerClient } from './viewer-fns.server'
import { MultipartCompleteSchema, MultipartInitSchema } from './schemas'

export const createS3ViewerUploadPresignUrlFn = createServerFn({
  method: 'POST',
})
  .inputValidator(MultipartInitSchema)
  .handler(async ({ data }) => {
    const { client } = await getViewerClient(data.bucketName)
    const contentType =
      data.contentType && data.contentType.length > 0
        ? data.contentType
        : 'application/octet-stream'

    const created = await client.send(
      new CreateMultipartUploadCommand({
        Bucket: data.bucketName,
        Key: data.objectKey,
        ContentType: contentType,
      }),
    )

    const uploadId = created.UploadId
    if (!uploadId) {
      throw new Error('Failed to create multipart upload session')
    }

    const partUrls = await Promise.all(
      Array.from({ length: data.partCount }, async (_, index) => {
        const partNumber = index + 1
        const presignedUrl = await getSignedUrl(
          client,
          new UploadPartCommand({
            Bucket: data.bucketName,
            Key: data.objectKey,
            UploadId: uploadId,
            PartNumber: partNumber,
          }),
          { expiresIn: data.expiresInSeconds },
        )

        return { partNumber, presignedUrl }
      }),
    )

    return {
      uploadId,
      partUrls,
      contentType,
      provider: 's3-viewer',
    }
  })

export const completeS3ViewerMultipartUploadFn = createServerFn({
  method: 'POST',
})
  .inputValidator(MultipartCompleteSchema)
  .handler(async ({ data }) => {
    const { client } = await getViewerClient(data.bucketName)

    await client.send(
      new CompleteMultipartUploadCommand({
        Bucket: data.bucketName,
        Key: data.objectKey,
        UploadId: data.uploadId,
        MultipartUpload: {
          Parts: [...data.parts]
            .sort((a, b) => a.partNumber - b.partNumber)
            .map((part) => ({
              PartNumber: part.partNumber,
              ETag: part.eTag,
            })),
        },
      }),
    )

    return { ok: true }
  })
