import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog'
import type { ObjectPayload } from '@/components/storage/object-operations-types'

type ObjectOperationsPermissionsTabProps = {
  payload: ObjectPayload
  onToggle: (nextAcl: ObjectPayload['acl']) => void
  isPending: boolean
}

export function ObjectOperationsPermissionsTab({
  payload,
  onToggle,
  isPending,
}: ObjectOperationsPermissionsTabProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const nextAcl = payload.acl === 'private' ? 'public-read' : 'private'
  const isPublic = payload.acl === 'public-read'

  return (
    <>
      <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            ACL
          </p>
          <p className={isPublic ? 'text-amber-200' : 'text-foreground'}>
            {isPublic ? 'Public read enabled' : 'Private'}
          </p>
        </div>
        {isPublic && (
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-200">
            Public access is active for this object.
          </div>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setConfirmOpen(true)}
          disabled={isPending}
          className={
            isPublic
              ? 'border-border/60 bg-muted/30 text-foreground'
              : 'border-amber-500/40 text-amber-200 hover:bg-amber-500/10'
          }
        >
          Toggle ACL
        </Button>
      </div>

      <ConfirmActionDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Change object permissions?"
        description="This updates the ACL for the selected object."
        confirmLabel={nextAcl === 'public-read' ? 'Allow public read' : 'Make private'}
        confirmVariant={nextAcl === 'public-read' ? 'warning' : 'primary'}
        onConfirm={() => {
          onToggle(nextAcl)
          setConfirmOpen(false)
        }}
      />
    </>
  )
}

