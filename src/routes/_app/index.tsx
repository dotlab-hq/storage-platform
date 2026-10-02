import { createFileRoute } from '@tanstack/react-router'
import { isAuthenticatedMiddleware } from '@/middlewares/isAuthenticated'
import { folderItemsQuery, quotaQuery } from '@/lib/storage/folder-query'
import { folderIdFromNav } from '@/hooks/use-folder-navigation'
import { StoragePage } from './-storage-page'
import { StoragePageSkeleton } from './-storage-page-skeleton'

type HomeSearch = {
  /** Opens the upload dialog on arrival (used by the dock / QR flows). */
  upload?: boolean
  /** Encoded folder id, see `lib/nav-token.ts`. */
  nav?: string
}

function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value
  if (value === '1' || value === 'true') return true
  if (value === '0' || value === 'false') return false
  return undefined
}

export const Route = createFileRoute('/_app/')({
  server: {
    middleware: [isAuthenticatedMiddleware],
  },
  validateSearch: (search: Record<string, unknown>): HomeSearch => ({
    upload: parseBoolean(search.upload),
    nav: typeof search.nav === 'string' ? search.nav : undefined,
  }),
  loaderDeps: ({ search }) => ({ folderId: folderIdFromNav(search.nav) }),
  // Prefetch into the query cache; the page reads it back with suspense
  // queries, so it renders complete on the first paint (SSR and client).
  loader: async ({ context: { queryClient }, deps }) => {
    await Promise.all([
      queryClient.ensureInfiniteQueryData(folderItemsQuery(deps.folderId)),
      queryClient.ensureQueryData(quotaQuery()),
    ])
  },
  pendingComponent: StoragePageSkeleton,
  component: StoragePage,
})
