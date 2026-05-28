import type { ReactNode } from 'react'
import { Cloud, FolderLock, Power, ShieldCheck } from 'lucide-react'
import type { S3BucketItem } from '@/types/s3-buckets'

type BucketManagerOverviewProps = {
  buckets: S3BucketItem[]
  filteredBuckets: S3BucketItem[]
  defaultBucketName: string | null
}

function StatCard(props: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center justify-between text-muted-foreground">
        <p className="text-xs font-medium uppercase tracking-[0.16em]">
          {props.label}
        </p>
        {props.icon}
      </div>
      <p className="mt-2 text-xl font-semibold tracking-tight">{props.value}</p>
    </div>
  )
}

export function BucketManagerOverview(props: BucketManagerOverviewProps) {
  const lockedBuckets = props.buckets.filter(
    (bucket) => bucket.isDefault,
  ).length
  const activeBuckets = props.buckets.filter((bucket) => bucket.isActive).length
  return (
    <>
      <div className="grid gap-2 md:grid-cols-4">
        <StatCard
          label="Total Buckets"
          value={String(props.buckets.length)}
          icon={<Cloud className="h-4 w-4" />}
        />
        <StatCard
          label="Active"
          value={String(activeBuckets)}
          icon={<Power className="h-4 w-4" />}
        />
        <StatCard
          label="Visible"
          value={String(props.filteredBuckets.length)}
          icon={<ShieldCheck className="h-4 w-4" />}
        />
        <StatCard
          label="Locked"
          value={String(lockedBuckets)}
          icon={<FolderLock className="h-4 w-4" />}
        />
      </div>

      {props.defaultBucketName ? (
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/25 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">
              Default assets bucket: {props.defaultBucketName}
            </p>
            <p className="text-muted-foreground">
              Reserved for attachments. Destructive operations stay locked.
            </p>
          </div>
          <span className="w-fit rounded-md border border-border bg-background px-2 py-1 text-xs font-medium">
            protected
          </span>
        </div>
      ) : null}
    </>
  )
}
