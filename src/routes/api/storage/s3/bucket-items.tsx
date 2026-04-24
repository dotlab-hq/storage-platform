import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { getAuthenticatedUser } from '@/lib/server-auth'
import { getVirtualBucketCredentials } from '@/lib/s3-gateway/virtual-buckets'
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3'

const BucketItemsQuerySchema = z.object({
  bucketName: z.string().trim().min(1).max(63),
  prefix: z.string().optional(),
  continuationToken: z.string().optional(),
  maxKeys: z.coerce.number().int().min(1).max(1000).optional().default(250),
})

function errorToMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? 'Invalid request'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Failed to list bucket files'
}

function toFolderEntry(prefix: string): { name: string; prefix: string } {
  const trimmed = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix
  const name = trimmed.split('/').at(-1) ?? trimmed
  return { name, prefix }
}

function toFileEntry(
  key: string,
  sizeInBytes: number,
  eTag: string | null,
  lastModified: Date | null,
): {
  key: string
  name: string
  sizeInBytes: number
  eTag: string | null
  lastModified: string | null
} {
  return {
    key,
    name: key.split('/').at(-1) ?? key,
    sizeInBytes,
    eTag,
    lastModified: lastModified ? lastModified.toISOString() : null,
  }
}

export const Route = createFileRoute('/api/storage/s3/bucket-items')({
  component: () => null,
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const currentUser = await getAuthenticatedUser()
          const url = new URL(request.url)
          const query = BucketItemsQuerySchema.parse({
            bucketName: url.searchParams.get('bucketName'),
            prefix: url.searchParams.get('prefix'),
            continuationToken: url.searchParams.get('continuationToken'),
            maxKeys: url.searchParams.get('maxKeys'),
          })

          // Get virtual bucket credentials (S3-compatible)
          const credentials = await getVirtualBucketCredentials(
            currentUser.id,
            query.bucketName,
          )

          // Create S3 client
          const client = new S3Client({
            region: credentials.region,
            endpoint: credentials.endpoint,
            forcePathStyle: true,
            credentials: {
              accessKeyId: credentials.accessKeyId,
              secretAccessKey: credentials.secretAccessKey,
            },
          })

          // List objects using S3 SDK
          const result = await client.send(
            new ListObjectsV2Command({
              Bucket: query.bucketName,
              Prefix: query.prefix || undefined,
              Delimiter: '/',
              ContinuationToken: query.continuationToken || undefined,
              MaxKeys: query.maxKeys,
            }),
          )

          // Transform folders
          const folders = (result.CommonPrefixes ?? [])
            .map((entry) => entry.Prefix ?? '')
            .filter((prefix) => prefix.length > 0)
            .map(toFolderEntry)

          // Transform files
          const files = (result.Contents ?? [])
            .map((entry) => {
              const key = entry.Key ?? ''
              return key.length > 0
                ? toFileEntry(
                    key,
                    entry.Size ?? 0,
                    entry.ETag ?? null,
                    entry.LastModified ?? null,
                  )
                : null
            })
            .filter(
              (entry): entry is NonNullable<typeof entry> => entry !== null,
            )
            .filter((entry) => {
              if (entry.key.endsWith('/')) return false
              if (query.prefix && entry.key === query.prefix) return false
              return true
            })

          const response = {
            prefix: result.Prefix ?? query.prefix ?? '',
            keyCount: result.KeyCount ?? 0,
            isTruncated: result.IsTruncated ?? false,
            nextContinuationToken: result.NextContinuationToken ?? null,
            folders,
            objects: files,
          }

          return Response.json(response)
        } catch (error) {
          const message = errorToMessage(error)
          const status =
            message === 'Virtual bucket not found'
              ? 404
              : message === 'Unauthorized'
                ? 401
                : error instanceof z.ZodError
                  ? 400
                  : 500
          return Response.json({ error: message }, { status })
        }
      },
    },
  },
})
