import { useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { S3BucketViewer } from '@/components/storage/s3-bucket-viewer'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { isAuthenticatedMiddleware } from '@/middlewares/isAuthenticated'

export const Route = createFileRoute('/_app/buckets/$bucketName')({
  server: {
    middleware: [isAuthenticatedMiddleware],
  },
  component: BucketFilesPage,
})

function BucketFilesPage() {
  const { bucketName } = Route.useParams()

  const decodedName = useMemo(
    () => decodeURIComponent(bucketName),
    [bucketName],
  )

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
            <h2 className="text-lg font-semibold">{decodedName}</h2>
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

        <S3BucketViewer bucketName={decodedName} />
      </div>
    </SidebarInset>
  )
}
