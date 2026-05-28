import { PageSkeleton } from '@/components/ui/page-skeleton'
import { BucketManagerTable } from '@/components/storage/bucket-manager-table'
import type { S3BucketItem } from '@/types/s3-buckets'

type BucketManagerTablePanelProps = {
  buckets: S3BucketItem[]
  filteredBuckets: S3BucketItem[]
  isLoading: boolean
  error: string | null
  pendingByBucket: Record<string, 'empty' | 'delete' | 'create' | undefined>
  onView: (bucketName: string) => void
  onSettings: (bucketName: string) => void
  onObjectOps: (bucketName: string) => void
  onCredentials: (bucketName: string) => Promise<void>
  onEmpty: (bucketName: string, isDefault: boolean | undefined) => Promise<void>
  onDelete: (
    bucketName: string,
    isDefault: boolean | undefined,
  ) => Promise<void>
}

export function BucketManagerTablePanel({
  buckets,
  filteredBuckets,
  isLoading,
  error,
  pendingByBucket,
  onView,
  onSettings,
  onObjectOps,
  onCredentials,
  onEmpty,
  onDelete,
}: BucketManagerTablePanelProps) {
  if (error) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-2 py-2">
        <PageSkeleton variant="compact" className="h-5 w-40" />
        <PageSkeleton variant="default" className="h-12" />
        <PageSkeleton variant="default" className="h-12" />
        <PageSkeleton variant="default" className="h-12" />
      </div>
    )
  }

  if (filteredBuckets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        {buckets.length === 0
          ? 'No virtual buckets found for your account.'
          : 'No buckets match your current search.'}
      </div>
    )
  }

  return (
    <BucketManagerTable
      buckets={filteredBuckets}
      pendingByBucket={pendingByBucket}
      onView={onView}
      onSettings={onSettings}
      onObjectOps={onObjectOps}
      onCredentials={onCredentials}
      onEmpty={onEmpty}
      onDelete={onDelete}
    />
  )
}
