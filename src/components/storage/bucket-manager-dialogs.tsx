import { lazy, Suspense } from 'react'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import type { S3BucketCredentials } from '@/types/s3-buckets'

const BucketCredentialsDialog = lazy(() =>
  import('@/components/storage/bucket-credentials-dialog').then((m) => ({
    default: m.BucketCredentialsDialog,
  })),
)
const BucketSettingsDialog = lazy(() =>
  import('@/components/storage/bucket-settings-dialog').then((m) => ({
    default: m.BucketSettingsDialog,
  })),
)
const ObjectOperationsDialog = lazy(() =>
  import('@/components/storage/object-operations-dialog').then((m) => ({
    default: m.ObjectOperationsDialog,
  })),
)
const S3ViewerModal = lazy(() =>
  import('@/components/storage/s3-viewer-modal').then((m) => ({
    default: m.S3ViewerModal,
  })),
)

type BucketManagerDialogsProps = {
  activeCredentialsBucket: string | null
  activeSettingsBucket: string | null
  activeObjectOpsBucket: string | null
  activeViewerBucket: string | null
  activeCredentials: S3BucketCredentials | undefined
  onCopy: (value: string) => Promise<void>
  onRotate: (bucketName: string) => Promise<S3BucketCredentials | null>
  onCloseCredentials: () => void
  onCloseSettings: () => void
  onCloseObjectOps: () => void
  onCloseViewer: () => void
}

export function BucketManagerDialogs(props: BucketManagerDialogsProps) {
  return (
    <Suspense fallback={<PageSkeleton variant="modal" />}>
      <BucketCredentialsDialog
        bucketName={props.activeCredentialsBucket}
        credentials={props.activeCredentials}
        onCopy={props.onCopy}
        onRotate={
          props.activeCredentialsBucket
            ? async () => props.onRotate(props.activeCredentialsBucket!)
            : undefined
        }
        onOpenChange={(open) => {
          if (!open) {
            props.onCloseCredentials()
          }
        }}
      />

      <BucketSettingsDialog
        bucketName={props.activeSettingsBucket}
        onOpenChange={(open) => {
          if (!open) {
            props.onCloseSettings()
          }
        }}
      />

      <ObjectOperationsDialog
        bucketName={props.activeObjectOpsBucket}
        onOpenChange={(open) => {
          if (!open) {
            props.onCloseObjectOps()
          }
        }}
      />

      <S3ViewerModal
        open={props.activeViewerBucket !== null}
        bucketName={props.activeViewerBucket}
        onOpenChange={(open) => {
          if (!open) {
            props.onCloseViewer()
          }
        }}
      />
    </Suspense>
  )
}
