/**
 * Every TanStack Query key used by the app lives here, so invalidations can't
 * drift from the queries they target.
 */

export const ADMIN_QUERY_KEYS = {
  dashboard: ['admin-dashboard'] as const,
  users: ['admin-users'] as const,
  providers: ['admin-providers'] as const,
  summary: ['admin-summary'] as const,
} as const

export const STORAGE_QUERY_KEYS = {
  /** Prefix shared by all folder listings (invalidate to refresh them all). */
  allFolders: ['storage-items'] as const,
  folderItems: (folderId: string | null) =>
    ['storage-items', folderId ?? 'root'] as const,
  quota: ['storage-quota'] as const,
  /** Prefix shared by all trash listings. */
  trash: ['trash-items'] as const,
  trashFolder: (parentFolderId: string | null) =>
    ['trash-items', parentFolderId ?? 'root'] as const,
} as const

export const SETTINGS_QUERY_KEYS = {
  snapshot: ['settings-snapshot'] as const,
  userProviders: ['user-providers'] as const,
} as const

export const S3_QUERY_KEYS = {
  buckets: ['s3-buckets'] as const,
  /** Prefix shared by every cached listing of one bucket. */
  bucket: (bucketName: string) => ['s3-viewer', bucketName] as const,
  bucketItems: (bucketName: string, prefix: string) =>
    ['s3-viewer', bucketName, prefix] as const,
} as const

export const RECENT_QUERY_KEYS = {
  items: ['recent-items'] as const,
} as const
