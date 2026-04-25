import { createFileRoute } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-start'

import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { getVirtualBucketCredentials } from '@/lib/s3-gateway/virtual-buckets'
import { DEFAULT_ASSETS_BUCKET_NAME } from '@/lib/storage/assets-bucket'

const BucketActionSchema = z.object({
  bucketName: z.string().trim().min(3).max(63).optional(),
})

function normalizeEndpoint(endpoint: string): string {
  const trimmed = endpoint.trim().replace(/\/+$/, '')
  if (trimmed.endsWith('/api/storage/s3')) {
    return trimmed
  }
  return `${trimmed}/api/storage/s3`
}

function resolveCompatEndpoint(request: Request): string {
  const configured =
    process.env.S3_COMPAT_ENDPOINT?.trim() ||
    process.env.PUBLIC_S3_COMPAT_ENDPOINT?.trim()
  if (configured) {
    return normalizeEndpoint(configured)
  }

  const origin = new URL(request.url).origin
  return `${origin}/api/storage/s3`
}

function errorToMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? 'Invalid request'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Failed to issue credentials'
}

export const Route = createFileRoute('/api/storage/s3/bucket-credentials')({
  component: () => null,
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const currentUser = await getAuthenticatedUser()
          const payload = BucketActionSchema.parse(await request.json())
          const bucketName = payload.bucketName ?? DEFAULT_ASSETS_BUCKET_NAME
          const credentials = await getVirtualBucketCredentials(
            currentUser.id,
            bucketName,
          )
          return Response.json({
            ok: true,
            credentials: {
              ...credentials,
              endpoint: resolveCompatEndpoint(request),
              // region is already correctly set from the bucket's stored region
            },
          })
        } catch (error) {
          const status = error instanceof z.ZodError ? 400 : 500
          return Response.json(
            { ok: false, error: errorToMessage(error) },
            { status },
          )
        }
      },
    },
  },
})
