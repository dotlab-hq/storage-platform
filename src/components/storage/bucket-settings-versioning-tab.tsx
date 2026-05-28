import { Button } from '@/components/ui/button'
import type {
  BucketSettingsPayload,
  BucketSettingsUpdate,
} from '@/components/storage/bucket-settings-types'

type BucketSettingsVersioningTabProps = {
  bucketName: string
  payload: BucketSettingsPayload
  onUpdate: (update: BucketSettingsUpdate) => void
  isPending: boolean
}

export function BucketSettingsVersioningTab({
  bucketName,
  payload,
  onUpdate,
  isPending,
}: BucketSettingsVersioningTabProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border border-border/60 bg-muted/30 p-2">
        <Button
          size="sm"
          disabled={isPending}
          className={
            payload.versioning === 'enabled'
              ? 'bg-muted/30 text-foreground'
              : 'border border-border/60 bg-muted/30 text-foreground'
          }
          onClick={() =>
            onUpdate({
              action: 'versioning',
              bucketName,
              state: 'enabled',
            })
          }
        >
          Enable
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          className={
            payload.versioning === 'suspended'
              ? 'border-amber-500/50 bg-amber-500/15 text-foreground'
              : 'border-amber-500/30 text-foreground hover:bg-amber-500/10'
          }
          onClick={() =>
            onUpdate({
              action: 'versioning',
              bucketName,
              state: 'suspended',
            })
          }
        >
          Suspend
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          className={
            payload.versioning === 'disabled'
              ? 'border-slate-500/50 bg-slate-500/10 text-slate-200'
              : 'border-slate-500/40 text-slate-200 hover:bg-slate-500/10'
          }
          onClick={() =>
            onUpdate({
              action: 'versioning',
              bucketName,
              state: 'disabled',
            })
          }
        >
          Disable
        </Button>
      </div>
      <div className="space-y-1 text-xs text-muted-foreground">
        <p>Versioning keeps older object revisions recoverable.</p>
        <p>Suspended retains existing versions but pauses new ones.</p>
      </div>
    </div>
  )
}

