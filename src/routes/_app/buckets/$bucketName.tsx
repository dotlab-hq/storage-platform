import { createFileRoute } from '@tanstack/react-router'
import { S3BucketViewerSkeleton } from '@/components/storage/s3-bucket-viewer-skeleton'
import { bucketItemsQuery, normalizePrefix } from '@/lib/s3-buckets/queries'
import { isAuthenticatedMiddleware } from '@/middlewares/isAuthenticated'
import { BucketFilesLayout, BucketFilesPage } from './-bucket-files-page'

type BucketSearch = {
  /** Folder being browsed, e.g. 'photos/2024/' (omitted = bucket root). */
  prefix?: string
}

export const Route = createFileRoute('/_app/buckets/$bucketName')({
  server: {
    middleware: [isAuthenticatedMiddleware],
  },
  validateSearch: (search: Record<string, unknown>): BucketSearch => {
    const prefix =
      typeof search.prefix === 'string' ? normalizePrefix(search.prefix) : ''
    return { prefix: prefix || undefined }
  },
  loaderDeps: ({ search }) => ({ prefix: search.prefix ?? '' }),
  // Prefetch exactly the listing the URL asks for; the page reads the same
  // query, so a refresh or back/forward shows the right folder immediately.
  loader: ({ context: { queryClient }, params, deps }) =>
    queryClient.ensureInfiniteQueryData(
      bucketItemsQuery(params.bucketName, deps.prefix),
    ),
  pendingComponent: BucketFilesPending,
  component: BucketFilesRoute,
})

/** Skeleton with the same frame as the bucket page. */
function BucketFilesPending() {
  const { bucketName } = Route.useParams()
  return (
    <BucketFilesLayout bucketName={bucketName}>
      <S3BucketViewerSkeleton />
    </BucketFilesLayout>
  )
}

/** Wires the URL (bucket param + prefix search) to the bucket page. */
function BucketFilesRoute() {
  const { bucketName } = Route.useParams()
  const { prefix = '' } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <BucketFilesPage
      bucketName={bucketName}
      prefix={prefix}
      onPrefixChange={(nextPrefix) =>
        void navigate({ search: { prefix: nextPrefix || undefined } })
      }
    />
  )
}
