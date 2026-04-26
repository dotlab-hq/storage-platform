import type { ReactNode } from 'react'
import { Cloud, FolderLock, ShieldCheck } from 'lucide-react'
import type { S3BucketItem } from '@/types/s3-buckets'

type BucketManagerOverviewProps = {
  buckets: S3BucketItem[]
  filteredBuckets: S3BucketItem[]
  defaultBucketName: string | null
}

function StatCard(props: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/70 p-3">
      <div className="flex items-center justify-between text-muted-foreground">
        <p className="text-xs uppercase tracking-[0.2em]">{props.label}</p>
        {props.icon}
      </div>
      <p className="mt-1 text-lg font-semibold tracking-tight">{props.value}</p>
    </div>
  )
}

export function BucketManagerOverview(props: BucketManagerOverviewProps) {
  const lockedBuckets = props.buckets.filter(
    (bucket) => bucket.isDefault,
  ).length
  return (
    <>
      <div className="grid gap-2 md:grid-cols-3">
        <StatCard
          label="Total Buckets"
          value={String(props.buckets.length)}
          icon={<Cloud className="h-4 w-4" />}
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
        <div className="rounded-xl border border-border bg-muted/35 p-3 text-sm">
          <p className="font-medium">
            Default assets bucket: {props.defaultBucketName}
          </p>
          <p className="text-muted-foreground">
            Reserved for attachments. Delete and empty actions are disabled for
            safety.
          </p>
        </div>
      ) : null}
    </>
  )
}
