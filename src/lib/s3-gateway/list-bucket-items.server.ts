import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3'
import { getVirtualBucketCredentials } from '@/lib/s3-gateway/virtual-buckets'

export type S3BucketItemsResponse = {
  prefix: string
  keyCount: number
  isTruncated: boolean
  nextContinuationToken: string | null
  folders: { name: string; prefix: string }[]
  objects: {
    key: string
    name: string
    sizeInBytes: number
    eTag: string | null
    lastModified: string | null
  }[]
}

type ListBucketItemsParams = {
  userId: string
  bucketName: string
  prefix?: string
  continuationToken?: string
  maxKeys: number
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

export async function listBucketItems(
  params: ListBucketItemsParams,
): Promise<S3BucketItemsResponse> {
  const credentials = await getVirtualBucketCredentials(
    params.userId,
    params.bucketName,
  )

  // Defensive: ensure region is never empty
  if (!credentials.region || !credentials.region.trim()) {
    throw new Error(
      `S3 region is missing for bucket ${params.bucketName}. Check provider configuration.`,
    )
  }

  const client = new S3Client({
    region: credentials.region,
    endpoint: credentials.endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
    },
  })

  const result = await client.send(
    new ListObjectsV2Command({
      Bucket: params.bucketName,
      Prefix: params.prefix || undefined,
      Delimiter: '/',
      ContinuationToken: params.continuationToken || undefined,
      MaxKeys: params.maxKeys,
    }),
  )

  const folders = (result.CommonPrefixes ?? [])
    .map((entry) => entry.Prefix ?? '')
    .filter((prefix) => prefix.length > 0)
    .map(toFolderEntry)

  const objects = (result.Contents ?? [])
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
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .filter((entry) => {
      if (entry.key.endsWith('/')) return false
      if (params.prefix && entry.key === params.prefix) return false
      return true
    })

  return {
    prefix: result.Prefix ?? params.prefix ?? '',
    keyCount: result.KeyCount ?? 0,
    isTruncated: result.IsTruncated ?? false,
    nextContinuationToken: result.NextContinuationToken ?? null,
    folders,
    objects,
  }
}
