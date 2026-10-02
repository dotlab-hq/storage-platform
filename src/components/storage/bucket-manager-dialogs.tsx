import { Suspense, useEffect } from 'react'
import { lazyWithPreload, preloadWhenIdle } from '@/lib/lazy-with-preload'
import type { S3BucketCredentials } from '@/types/s3-buckets'

const BucketCredentialsDialog = lazyWithPreload(() =>
  import('@/components/storage/bucket-credentials-dialog').then((m) => ({
    default: m.BucketCredentialsDialog,
  })),
)
const BucketSettingsDialog = lazyWithPreload(() =>
  import('@/components/storage/bucket-settings-dialog').then((m) => ({
    default: m.BucketSettingsDialog,
  })),
)
const ObjectOperationsDialog = lazyWithPreload(() =>
  import('@/components/storage/object-operations-dialog').then((m) => ({
    default: m.ObjectOperationsDialog,
  })),
)
const S3ViewerModal = lazyWithPreload(() =>
  import('@/components/storage/s3-viewer-modal').then((m) => ({
    default: m.S3ViewerModal,
  })),
)

/** Which bucket dialog is open, and for which bucket. */
export type BucketDialog = {
  kind: 'credentials' | 'settings' | 'objectOps' | 'viewer'
  bucketName: string
}

type BucketManagerDialogsProps = {
  dialog: BucketDialog | null
  credentials: S3BucketCredentials | undefined
  isDefaultBucket: boolean
  onRotate: (bucketName: string) => Promise<S3BucketCredentials | null>
  onClose: () => void
}

/**
 * The per-bucket dialogs of the buckets page. Only the open one is mounted;
 * their code is preloaded when the browser is idle so no fallback shows.
 */
export function BucketManagerDialogs({
  dialog,
  credentials,
  isDefaultBucket,
  onRotate,
  onClose,
}: BucketManagerDialogsProps) {
  useEffect(
    () =>
      preloadWhenIdle(
        BucketCredentialsDialog.preload,
        BucketSettingsDialog.preload,
        ObjectOperationsDialog.preload,
        S3ViewerModal.preload,
      ),
    [],
  )

  if (!dialog) return null
  const { kind, bucketName } = dialog
  const closeOnHide = (open: boolean) => {
    if (!open) onClose()
  }

  return (
    <Suspense fallback={null}>
      {kind === 'credentials' && (
        <BucketCredentialsDialog
          bucketName={bucketName}
          credentials={credentials}
          isDefaultAssets={isDefaultBucket}
          onCopy={(value) => navigator.clipboard.writeText(value)}
          onRotate={() => onRotate(bucketName)}
          onOpenChange={closeOnHide}
        />
      )}
      {kind === 'settings' && (
        <BucketSettingsDialog
          bucketName={bucketName}
          onOpenChange={closeOnHide}
        />
      )}
      {kind === 'objectOps' && (
        <ObjectOperationsDialog
          bucketName={bucketName}
          onOpenChange={closeOnHide}
        />
      )}
      {kind === 'viewer' && (
        <S3ViewerModal bucketName={bucketName} onOpenChange={closeOnHide} />
      )}
    </Suspense>
  )
}
