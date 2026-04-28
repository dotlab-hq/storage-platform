import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { S3BucketViewer } from '@/components/storage/s3-bucket-viewer'
import { Button } from '@/components/ui/button'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { listBucketItems } from '@/lib/s3-gateway/list-bucket-items.server'
import { getAuthenticatedUser } from '@/lib/server-auth.server'
import { isAuthenticatedMiddleware } from '@/middlewares/isAuthenticated'

const InitialBucketViewSchema = z.object({
  bucketName: z.string().trim().min(1),
  folderPath: z.string().optional(),
})

function normalizePrefix(rawFolderPath?: string): string {
  if (!rawFolderPath) return ''
  const trimmed = rawFolderPath.trim()
  if (!trimmed || trimmed === '/') return ''
  const decoded = decodeURIComponent(trimmed)
  return decoded.endsWith('/') ? decoded : `${decoded}/`
}

const getInitialBucketViewFn = createServerFn({ method: 'GET' })
  .inputValidator(InitialBucketViewSchema)
  .handler(async ({ data }) => {
    const currentUser = await getAuthenticatedUser()
    const prefix = normalizePrefix(data.folderPath)
    const initialData = await listBucketItems({
      userId: currentUser.id,
      bucketName: data.bucketName,
      prefix,
      maxKeys: 500,
    })

    return {
      bucketName: data.bucketName,
      prefix,
      initialData,
    }
  })

export const Route = createFileRoute('/_app/buckets/$bucketName')({
  server: {
    middleware: [isAuthenticatedMiddleware],
  },
  loader: async ({ params }) => {
    const bucketName = decodeURIComponent(params.bucketName)
    return getInitialBucketViewFn({
      data: {
        bucketName,
        folderPath: params._splat,
      },
    })
  },
  pendingComponent: () => <PageSkeleton variant="default" className="m-4" />,
  component: BucketFilesPage,
})

function BucketFilesPage() {
  const { bucketName, prefix, initialData } = Route.useLoaderData()

  return (
    <SidebarInset>
      <header className="flex h-14 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-sm font-semibold">Bucket Files</h1>
      </header>
      <div className="space-y-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground text-xs">Virtual Bucket</p>
            <h2 className="text-lg font-semibold">{bucketName}</h2>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = '/buckets'
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Buckets
          </Button>
        </div>

        <S3BucketViewer
          bucketName={bucketName}
          initialPrefix={prefix}
          initialData={initialData}
        />
      </div>
    </SidebarInset>
  )
}
