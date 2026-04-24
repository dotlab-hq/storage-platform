import { z } from 'zod'

export const BucketSchema = z.object({
  bucketName: z.string().trim().min(1).max(63),
})

export const ListSchema = BucketSchema.extend({
  prefix: z.string().trim().optional(),
  maxKeys: z.number().int().min(1).max(1000).default(100),
  continuationToken: z.string().trim().optional(),
})

export const ObjectKeySchema = BucketSchema.extend({
  objectKey: z.string().trim().min(1),
})

export const UploadSchema = ObjectKeySchema.extend({
  contentBase64: z.string().min(1),
  contentType: z.string().trim().optional(),
})

export const PresignSchema = ObjectKeySchema.extend({
  expiresInSeconds: z.number().int().min(60).max(3600).default(900),
})

export const UploadPresignSchema = ObjectKeySchema.extend({
  contentType: z.string().trim().optional(),
  expiresInSeconds: z.number().int().min(60).max(3600).default(900),
})

export const MultipartInitSchema = ObjectKeySchema.extend({
  contentType: z.string().trim().optional(),
  expiresInSeconds: z.number().int().min(60).max(3600).default(900),
  partCount: z.number().int().min(1).max(10000),
})

export const MultipartCompleteSchema = ObjectKeySchema.extend({
  uploadId: z.string().min(1),
  parts: z
    .array(
      z.object({
        partNumber: z.number().int().positive(),
        eTag: z.string().trim().min(1),
      }),
    )
    .min(1),
})
