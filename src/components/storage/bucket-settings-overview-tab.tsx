import { Badge } from '@/components/ui/badge'
import type { BucketSettingsPayload } from '@/components/storage/bucket-settings-types'

type BucketSettingsOverviewTabProps = {
  payload: BucketSettingsPayload
}

export function BucketSettingsOverviewTab({
  payload,
}: BucketSettingsOverviewTabProps) {
  const statusChips = [
    payload.acl === 'public-read' ? 'Public' : 'Private',
    payload.versioning !== 'disabled' ? 'Versioned' : 'Unversioned',
  ]

  return (
    <div className="space-y-3 text-sm">
      <div className="grid gap-2 rounded-lg border border-emerald-500/20 bg-muted/20 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Bucket
        </p>
        <p className="text-lg font-semibold">{payload.bucket.name}</p>
        <p className="text-muted-foreground">Region: {payload.bucket.region}</p>
        <p className="text-muted-foreground">
          Ownership: {payload.bucket.objectOwnershipMode}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {statusChips.map((chip) => (
          <Badge
            key={chip}
            variant="outline"
            className="border-emerald-500/30 text-emerald-100"
          >
            {chip}
          </Badge>
        ))}
        <Badge
          variant="outline"
          className={
            payload.bucket.blockPublicAccess
              ? 'border-emerald-500/40 text-emerald-100'
              : 'border-amber-500/40 text-amber-200'
          }
        >
          {payload.bucket.blockPublicAccess ? 'Private access enforced' : 'Public ACLs allowed'}
        </Badge>
      </div>
    </div>
  )
}
