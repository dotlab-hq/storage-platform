import { createFileRoute } from '@tanstack/react-router'
import { isAuthenticatedMiddleware } from '@/middlewares/isAuthenticated'
import { trashFolderQuery } from '@/lib/storage/trash-query'
import { TrashPage } from './-components/-trash-page'
import { TrashPageSkeleton } from './-components/trash-page-skeleton'

export type TrashCrumb = { id: string; name: string }

type TrashSearch = {
  /** Trashed folders opened so far; the last one is being shown. */
  path?: TrashCrumb[]
}

function parsePath(value: unknown): TrashCrumb[] | undefined {
  if (!Array.isArray(value)) return undefined
  const crumbs = value.filter(
    (crumb): crumb is TrashCrumb =>
      typeof crumb?.id === 'string' && typeof crumb?.name === 'string',
  )
  return crumbs.length > 0 ? crumbs : undefined
}

export const Route = createFileRoute('/_app/trash/')({
  server: {
    middleware: [isAuthenticatedMiddleware],
  },
  validateSearch: (search: Record<string, unknown>): TrashSearch => ({
    path: parsePath(search.path),
  }),
  loaderDeps: ({ search }) => ({
    folderId: search.path?.at(-1)?.id ?? null,
  }),
  loader: ({ context: { queryClient }, deps }) =>
    queryClient.ensureQueryData(trashFolderQuery(deps.folderId)),
  pendingComponent: TrashPageSkeleton,
  component: TrashPage,
})
