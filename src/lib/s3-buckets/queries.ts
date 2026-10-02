import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import type { InfiniteData } from '@tanstack/react-query'
import { S3_QUERY_KEYS } from '@/lib/query-keys'
import { listBucketItemsFn, listBucketsFn } from '@/lib/s3-buckets/server'
import type {
  S3ListResponse,
  S3ViewerFileEntry,
  S3ViewerFolderEntry,
} from '@/components/storage/s3-viewer-types'

/**
 * Query definitions for the Buckets pages. Route loaders prefetch these
 * options and components read the very same ones, so there is a single copy
 * of each listing in the cache.
 */

const BUCKET_PAGE_SIZE = 500

/** The user's virtual buckets. */
export function bucketsQuery() {
  return queryOptions({
    queryKey: S3_QUERY_KEYS.buckets,
    queryFn: () => listBucketsFn(),
  })
}

/** Folders and objects directly under `prefix` ('' = bucket root), paginated. */
export function bucketItemsQuery(bucketName: string, prefix: string) {
  return infiniteQueryOptions({
    queryKey: S3_QUERY_KEYS.bucketItems(bucketName, prefix),
    queryFn: ({ pageParam }): Promise<S3ListResponse> =>
      listBucketItemsFn({
        data: {
          bucketName,
          prefix,
          maxKeys: BUCKET_PAGE_SIZE,
          continuationToken: pageParam ?? undefined,
        },
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.isTruncated ? lastPage.nextContinuationToken : undefined,
  })
}

/** Merges the pages of a bucket listing, dropping duplicates across pages. */
export function flattenBucketPages(
  data: InfiniteData<S3ListResponse> | undefined,
) {
  const folders = new Map<string, S3ViewerFolderEntry>()
  const files = new Map<string, S3ViewerFileEntry>()
  for (const page of data?.pages ?? []) {
    for (const folder of page.folders) folders.set(folder.prefix, folder)
    for (const file of page.objects) files.set(file.key, file)
  }
  return { folders: [...folders.values()], files: [...files.values()] }
}

/** Normalizes a folder path to the S3 prefix form used as query key ('' or 'a/b/'). */
export function normalizePrefix(rawPrefix: string | undefined): string {
  const trimmed = rawPrefix?.trim().replace(/^\/+/, '') ?? ''
  if (!trimmed) return ''
  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`
}
