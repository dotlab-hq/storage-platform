import { ListObjectsV2Command } from '@aws-sdk/client-s3'
import type { ListObjectsV2CommandOutput } from '@aws-sdk/client-s3'
import { getProviderClientById } from '@/lib/s3-provider-client'
import { isStatusMetadataError } from '@/lib/s3-gateway/s3-conditional-cache'

export interface ProviderContentsResponse {
  providerId: string
  providerName: string
  bucketName: string
  prefix: string
  keyCount: number
  isTruncated: boolean
  nextContinuationToken: string | null
  folders: {
    name: string
    prefix: string
  }[]
  files: {
    key: string
    name: string
    sizeInBytes: number
    eTag: string | null
    lastModified: string | null
  }[]
}

function normalizePrefix(prefix: string): string {
  return prefix.trim()
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
) {
  return {
    key,
    name: key.split('/').at(-1) ?? key,
    sizeInBytes,
    eTag,
    lastModified: lastModified ? lastModified.toISOString() : null,
  }
}

export async function listProviderContents({
  providerId,
  prefix,
  maxKeys,
}: {
  providerId: string
  prefix?: string | null
  maxKeys?: number
}): Promise<ProviderContentsResponse> {
  const provider = await getProviderClientById(providerId)
  const normalizedPrefix = normalizePrefix(prefix ?? '')

  let result: ListObjectsV2CommandOutput
  try {
    result = await provider.client.send(
      new ListObjectsV2Command({
        Bucket: provider.bucketName,
        Prefix: normalizedPrefix.length > 0 ? normalizedPrefix : undefined,
        Delimiter: '/',
        MaxKeys: maxKeys ?? 1000,
      }),
    )
  } catch (error) {
    // Some S3-compatible providers (e.g. the one behind storage.wpsadi.dev)
    // return NoSuchKey (404) for prefixes that don't exist or are empty
    // instead of returning an empty Contents list. Per the S3 spec, a list
    // call with no matches should return an empty result, not an error —
    // so treat the NoSuchKey case as "no objects".
    const status = isStatusMetadataError(error)
      ? error.$metadata?.httpStatusCode
      : null
    if (status === 404) {
      result = {
        CommonPrefixes: [],
        Contents: [],
        KeyCount: 0,
        IsTruncated: false,
        Prefix: normalizedPrefix,
        $metadata: {},
      } as ListObjectsV2CommandOutput
    } else {
      throw error
    }
  }

  const folders = (result.CommonPrefixes ?? [])
    .map((entry) => entry.Prefix ?? '')
    .filter((value) => value.length > 0)
    .map(toFolderEntry)

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
      (entry): entry is NonNullable<ReturnType<typeof toFileEntry>> =>
        entry !== null,
    )
    .filter((entry) => {
      if (entry.key.endsWith('/')) {
        return false
      }
      if (normalizedPrefix.length > 0 && entry.key === normalizedPrefix) {
        return false
      }
      return true
    })

  return {
    providerId: provider.providerId ?? providerId,
    providerName: provider.providerName,
    bucketName: provider.bucketName,
    prefix: result.Prefix ?? normalizedPrefix,
    keyCount: result.KeyCount ?? 0,
    isTruncated: result.IsTruncated ?? false,
    nextContinuationToken: result.NextContinuationToken ?? null,
    folders,
    files,
  }
}
