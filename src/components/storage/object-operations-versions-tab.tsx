import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog'
import type { ObjectPayload } from '@/components/storage/object-operations-types'

type ObjectOperationsVersionsTabProps = {
  payload: ObjectPayload
  onRestore: (versionId: string) => void
  isPending: boolean
}

export function ObjectOperationsVersionsTab({
  payload,
  onRestore,
  isPending,
}: ObjectOperationsVersionsTabProps) {
  const [pendingRestore, setPendingRestore] = useState<string | null>(null)

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-emerald-500/20">
        <div className="grid grid-cols-[1.2fr_0.6fr_0.6fr_0.6fr] gap-2 bg-muted/30 px-3 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span>Version</span>
          <span>Size</span>
          <span>Status</span>
          <span className="text-right">Action</span>
        </div>
        <div className="max-h-64 overflow-auto text-xs">
          {payload.versions.map((version) => (
            <div
              key={version.versionId}
              className="grid grid-cols-[1.2fr_0.6fr_0.6fr_0.6fr] gap-2 border-t border-emerald-500/10 px-3 py-2 text-muted-foreground"
            >
              <div className="break-all text-foreground">
                <p>{version.versionId}</p>
                <p className="text-[10px] text-muted-foreground">
                  {version.createdAt}
                </p>
              </div>
              <span>{version.sizeInBytes}</span>
              <span>
                {version.isDeleteMarker ? 'Delete marker' : 'Stored'}
              </span>
              <span className="text-right">
                {!version.isDeleteMarker && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-emerald-500/30 bg-muted/20 text-emerald-100"
                    onClick={() => setPendingRestore(version.versionId)}
                    disabled={isPending}
                  >
                    Restore
                  </Button>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      <ConfirmActionDialog
        open={pendingRestore !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingRestore(null)
          }
        }}
        title="Restore version?"
        description="This will roll the object back to the selected version."
        confirmLabel="Restore version"
        confirmVariant="warning"
        onConfirm={() => {
          if (pendingRestore) {
            onRestore(pendingRestore)
            setPendingRestore(null)
          }
        }}
      />
    </>
  )
}
