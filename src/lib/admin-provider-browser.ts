import { ListObjectsV2Command } from '@aws-sdk/client-s3'
import { getSystemProviderClientById } from '@/lib/s3-provider-client'

export type AdminProviderFolderEntry = {
  name: string
  prefix: string
}

export type AdminProviderFileEntry = {
  key: string
  name: string
  sizeInBytes: number
  eTag: string | null
  lastModified: string | null
}

export type AdminProviderContentsResponse = {
  providerId: string
  providerName: string
  bucketName: string
  prefix: string
  keyCount: number
  isTruncated: boolean
  nextContinuationToken: string | null
  folders: AdminProviderFolderEntry[]
  files: AdminProviderFileEntry[]
}

function normalizePrefix(prefix: string): string {
  return prefix.trim()
}

function toFolderEntry(prefix: string): AdminProviderFolderEntry {
  const trimmed = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix
  const name = trimmed.split('/').at(-1) ?? trimmed
  return { name, prefix }
}

function toFileEntry(
  key: string,
  sizeInBytes: number,
  eTag: string | null,
  lastModified: Date | null,
): AdminProviderFileEntry {
  return {
    key,
    name: key.split('/').at(-1) ?? key,
    sizeInBytes,
    eTag,
    lastModified: lastModified ? lastModified.toISOString() : null,
  }
}

export async function listAdminProviderContents(
  providerId: string,
  prefix: string,
  maxKeys: number,
  continuationToken?: string | null,
  searchQuery?: string,
): Promise<AdminProviderContentsResponse> {
  const provider = await getSystemProviderClientById(providerId)
  const normalizedPrefix = normalizePrefix(prefix)
  const result = await provider.client.send(
    new ListObjectsV2Command({
      Bucket: provider.bucketName,
      Prefix: normalizedPrefix.length > 0 ? normalizedPrefix : undefined,
      Delimiter: '/',
      ContinuationToken: continuationToken ?? undefined,
      MaxKeys: maxKeys,
    }),
  )

  const folders = (result.CommonPrefixes ?? [])
    .map((entry) => entry.Prefix ?? '')
    .filter((value) => value.length > 0)
    .map(toFolderEntry)

  // Apply search filter to folders if searchQuery is provided
  const filteredFolders =
    searchQuery && searchQuery.trim().length > 0
      ? folders.filter(
          (folder) =>
            folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            folder.prefix.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : folders

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
    .filter((entry): entry is AdminProviderFileEntry => entry !== null)
    .filter((entry) => {
      if (entry.key.endsWith('/')) {
        return false
      }
      if (normalizedPrefix.length > 0 && entry.key === normalizedPrefix) {
        return false
      }
      return true
    })

  // Apply search filter to files if searchQuery is provided
  const filteredFiles =
    searchQuery && searchQuery.trim().length > 0
      ? files.filter(
          (file) =>
            file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            file.key.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : files

  return {
    providerId: provider.providerId ?? providerId,
    providerName: provider.providerName,
    bucketName: provider.bucketName,
    prefix: result.Prefix ?? normalizedPrefix,
    keyCount: result.KeyCount ?? 0,
    isTruncated: result.IsTruncated ?? false,
    nextContinuationToken: result.NextContinuationToken ?? null,
    folders: filteredFolders,
    files: filteredFiles,
  }
}
