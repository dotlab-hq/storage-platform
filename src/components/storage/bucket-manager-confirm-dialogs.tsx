import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog'

type BucketManagerConfirmDialogsProps = {
  pendingEmptyBucket: string | null
  pendingDeleteBucket: string | null
  onClearEmpty: () => void
  onClearDelete: () => void
  /** Starts the action; progress and errors show in the bucket table. */
  onRunAction: (bucketName: string, action: 'empty' | 'delete') => void
}

/** Confirmation dialogs for emptying and deleting a bucket. */
export function BucketManagerConfirmDialogs({
  pendingEmptyBucket,
  pendingDeleteBucket,
  onClearEmpty,
  onClearDelete,
  onRunAction,
}: BucketManagerConfirmDialogsProps) {
  return (
    <>
      <ConfirmActionDialog
        open={pendingEmptyBucket !== null}
        onOpenChange={(open) => {
          if (!open) onClearEmpty()
        }}
        title="Empty bucket?"
        description="This will remove all objects and versions inside the bucket."
        confirmLabel="Empty bucket"
        confirmVariant="destructive"
        requiresConfirmation
        onConfirm={() => {
          if (pendingEmptyBucket) onRunAction(pendingEmptyBucket, 'empty')
          onClearEmpty()
        }}
      />

      <ConfirmActionDialog
        open={pendingDeleteBucket !== null}
        onOpenChange={(open) => {
          if (!open) onClearDelete()
        }}
        title="Delete this bucket permanently?"
        description="This will remove all objects, versions, and bucket metadata."
        confirmLabel="Delete bucket"
        confirmVariant="destructive"
        requiresConfirmation
        onConfirm={() => {
          if (pendingDeleteBucket) onRunAction(pendingDeleteBucket, 'delete')
          onClearDelete()
        }}
      />
    </>
  )
}
