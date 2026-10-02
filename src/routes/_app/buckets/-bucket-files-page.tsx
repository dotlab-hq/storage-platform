import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/app/page-header'
import { S3BucketViewer } from '@/components/storage/s3-bucket-viewer'
import { Button } from '@/components/ui/button'
import { SidebarInset } from '@/components/ui/sidebar'

/** Page frame for /buckets/$bucketName, shared with its pending skeleton. */
export function BucketFilesLayout({
  bucketName,
  children,
}: {
  bucketName: string
  children: ReactNode
}) {
  return (
    <SidebarInset>
      <PageHeader title="Bucket Files" />
      <div className="space-y-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground text-xs">Virtual Bucket</p>
            <h2 className="text-lg font-semibold">{bucketName}</h2>
          </div>
          <Button
            variant="outline"
            asChild
            className="border-emerald-500/30 bg-muted/20 text-emerald-100"
          >
            <Link to="/buckets">
              <ArrowLeft className="h-4 w-4" />
              Back to Buckets
            </Link>
          </Button>
        </div>
        {children}
      </div>
    </SidebarInset>
  )
}

type BucketFilesPageProps = {
  bucketName: string
  prefix: string
  onPrefixChange: (prefix: string) => void
}

/** Full-page browser for one bucket; the open folder lives in the URL. */
export function BucketFilesPage({
  bucketName,
  prefix,
  onPrefixChange,
}: BucketFilesPageProps) {
  return (
    <BucketFilesLayout bucketName={bucketName}>
      <S3BucketViewer
        bucketName={bucketName}
        prefix={prefix}
        onPrefixChange={onPrefixChange}
      />
    </BucketFilesLayout>
  )
}
