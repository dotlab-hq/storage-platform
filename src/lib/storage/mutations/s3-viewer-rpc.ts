import { createServerFn } from '@tanstack/react-start'
import {
  MultipartCompleteSchema,
  MultipartInitSchema,
  ObjectKeySchema,
  PresignSchema,
} from '@/lib/storage/mutations/s3-viewer/schemas'

export const createS3ViewerFolderFn = createServerFn({ method: 'POST' })
  .inputValidator(ObjectKeySchema)
  .handler(async ({ data }) => {
    const { createS3ViewerFolderFn: serverFn } =
      await import('@/lib/storage/mutations/s3-viewer/viewer-fns.server')
    return serverFn({ data })
  })

export const deleteS3ViewerObjectFn = createServerFn({ method: 'POST' })
  .inputValidator(ObjectKeySchema)
  .handler(async ({ data }) => {
    const { deleteS3ViewerObjectFn: serverFn } =
      await import('@/lib/storage/mutations/s3-viewer/viewer-fns.server')
    return serverFn({ data })
  })

export const createS3ViewerPresignUrlFn = createServerFn({ method: 'POST' })
  .inputValidator(PresignSchema)
  .handler(async ({ data }) => {
    const { createS3ViewerPresignUrlFn: serverFn } =
      await import('@/lib/storage/mutations/s3-viewer/viewer-fns.server')
    return serverFn({ data })
  })

export const createS3ViewerUploadPresignUrlFn = createServerFn({
  method: 'POST',
})
  .inputValidator(MultipartInitSchema)
  .handler(async ({ data }) => {
    const { createS3ViewerUploadPresignUrlFn: serverFn } =
      await import('@/lib/storage/mutations/s3-viewer/presigned-multipart')
    return serverFn({ data })
  })

export const completeS3ViewerMultipartUploadFn = createServerFn({
  method: 'POST',
})
  .inputValidator(MultipartCompleteSchema)
  .handler(async ({ data }) => {
    const { completeS3ViewerMultipartUploadFn: serverFn } =
      await import('@/lib/storage/mutations/s3-viewer/presigned-multipart')
    return serverFn({ data })
  })
