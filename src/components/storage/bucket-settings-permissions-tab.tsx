import { useEffect, useMemo, useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type {
  BucketSettingsPayload,
  BucketSettingsUpdate,
} from '@/components/storage/bucket-settings-types'
import { BucketSettingsPermissionsSidebar } from '@/components/storage/bucket-settings-permissions-sidebar'

type BucketSettingsPermissionsTabProps = {
  bucketName: string
  payload: BucketSettingsPayload
  onUpdate: (update: BucketSettingsUpdate) => void
  isPending: boolean
}

export function BucketSettingsPermissionsTab({
  bucketName,
  payload,
  onUpdate,
  isPending,
}: BucketSettingsPermissionsTabProps) {
  const [draftPolicy, setDraftPolicy] = useState(payload.policyJson)

  useEffect(() => {
    setDraftPolicy(payload.policyJson)
  }, [payload.policyJson])

  const policyPreview = useMemo(
    () => (draftPolicy.trim().length > 0 ? draftPolicy : payload.policyJson),
    [draftPolicy, payload.policyJson],
  )

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_260px]">
      <BucketSettingsPermissionsSidebar
        bucketName={bucketName}
        onUpdate={onUpdate}
        onSetPolicy={setDraftPolicy}
        isPending={isPending}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Policy Editor
          </p>
          <Button
            size="sm"
            onClick={() =>
              onUpdate({
                action: 'policy',
                bucketName,
                policyJson: draftPolicy.trim() || payload.policyJson,
              })
            }
            disabled={isPending}
            className="gap-2"
          >
            <Save className="h-4 w-4" /> Save Policy
          </Button>
        </div>
        <textarea
          aria-label="Bucket policy JSON"
          className="h-56 w-full rounded-lg border border border-border/60 bg-muted/30 p-3 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/70/40"
          value={draftPolicy}
          onChange={(e) => setDraftPolicy(e.target.value)}
        />
      </div>

      <div className="space-y-3 rounded-lg border border border-border/60 bg-muted/30 p-3 text-xs">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Security Summary
        </p>
        <div>
          <p className="text-foreground">ACL</p>
          <p className="text-muted-foreground">{payload.acl}</p>
        </div>
        <div>
          <p className="text-foreground">Block Public Access</p>
          <p className="text-muted-foreground">
            {payload.bucket.blockPublicAccess ? 'Enabled' : 'Disabled'}
          </p>
        </div>
        <div>
          <p className="text-foreground">Policy Preview</p>
          <pre className="mt-1 max-h-40 overflow-auto rounded-md border border-foreground/70/10 bg-background/70 p-2 text-[10px] text-muted-foreground">
            {policyPreview}
          </pre>
        </div>
      </div>

    </div>
  )
}


