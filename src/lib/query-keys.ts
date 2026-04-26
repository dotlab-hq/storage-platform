export const ADMIN_QUERY_KEYS = {
  dashboard: ['admin-dashboard'] as const,
  users: ['admin-users'] as const,
  providers: ['admin-providers'] as const,
  summary: ['admin-summary'] as const,
} as const

export const STORAGE_QUERY_KEYS = {
  folderItems: (folderId: string | null) =>
    ['storage-items', folderId ?? 'root'] as const,
  quota: ['storage-quota'] as const,
  trash: ['trash-items'] as const,
} as const
