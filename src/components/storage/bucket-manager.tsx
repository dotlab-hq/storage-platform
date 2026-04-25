import { lazy, useEffect, useMemo, useState, Suspense } from 'react'
import { Loader2, Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { useS3Buckets } from '@/hooks/use-s3-buckets'
import { BucketManagerTable } from '@/components/storage/bucket-manager-table'

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

function DialogSkeleton() {
  return <PageSkeleton variant="modal" />
}

export function BucketManager() {
  const [bucketName, setBucketName] = useState('')
  const [activeCredentialsBucket, setActiveCredentialsBucket] = useState<
    string | null
  >(null)
  const [activeSettingsBucket, setActiveSettingsBucket] = useState<
    string | null
  >(null)
  const [activeObjectOpsBucket, setActiveObjectOpsBucket] = useState<
    string | null
  >(null)
  const [activeViewerBucket, setActiveViewerBucket] = useState<string | null>(
    null,
  )
  const {
    buckets,
    defaultBucket,
    isLoading,
    isRefreshing,
    isCreating,
    pendingByBucket,
    credentialByBucket,
    error,
    refreshBuckets,
    createNewBucket,
    runBucketAction,
    fetchCredentials,
    rotateCredentials,
  } = useS3Buckets()

  useEffect(() => {
    void refreshBuckets()
  }, [refreshBuckets])

  const createDisabled = useMemo(
    () => bucketName.trim().length < 3 || isCreating,
    [bucketName, isCreating],
  )

  const activeCredentials = activeCredentialsBucket
    ? credentialByBucket[activeCredentialsBucket]
    : undefined

  return (
    <section className="space-y-4 rounded-2xl border border-border/80 bg-card/70 p-4 backdrop-blur-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">S3 Buckets</h2>
          <p className="text-muted-foreground text-sm">
            Monochrome manager with a locked default assets bucket for
            attachments.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void refreshBuckets()}
          disabled={isRefreshing || isLoading}
          className="gap-2"
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={bucketName}
          onChange={(event) => setBucketName(event.target.value)}
          placeholder="new-bucket-name"
          className="sm:max-w-sm"
        />
        <Button
          onClick={async () => {
            const created = await createNewBucket(bucketName)
            if (created) {
              setBucketName('')
            }
          }}
          disabled={createDisabled}
          className="gap-2"
        >
          {isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Create Bucket
        </Button>
      </div>

      {defaultBucket ? (
        <div className="rounded-lg border border-border bg-muted/35 p-3 text-sm">
          <p className="font-medium">
            Default assets bucket: {defaultBucket.name}
          </p>
          <p className="text-muted-foreground">
            This bucket is reserved for attachments and is locked from delete
            and empty actions.
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-2 py-4">
          <PageSkeleton variant="compact" className="h-5 w-40" />
          <PageSkeleton variant="default" className="h-12" />
          <PageSkeleton variant="default" className="h-12" />
          <PageSkeleton variant="default" className="h-12" />
        </div>
      ) : null}

      {!isLoading && buckets.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-sm">
          No virtual buckets found for your account.
        </div>
      ) : null}

      {!isLoading && buckets.length > 0 ? (
        <BucketManagerTable
          buckets={buckets}
          pendingByBucket={pendingByBucket}
          onView={setActiveViewerBucket}
          onSettings={setActiveSettingsBucket}
          onObjectOps={setActiveObjectOpsBucket}
          onCredentials={async (name) => {
            const credentials = await fetchCredentials(name)
            if (credentials) {
              setActiveCredentialsBucket(name)
            }
          }}
          onEmpty={async (name, isDefault) => {
            if (!isDefault) {
              await runBucketAction(name, 'empty')
            }
          }}
          onDelete={async (name, isDefault) => {
            if (!isDefault) {
              await runBucketAction(name, 'delete')
            }
          }}
        />
      ) : null}

      <Suspense fallback={<DialogSkeleton />}>
        <BucketCredentialsDialog
          bucketName={activeCredentialsBucket}
          credentials={activeCredentials}
          onCopy={async (value) => navigator.clipboard.writeText(value)}
          onRotate={
            activeCredentialsBucket
              ? async () => {
                  if (activeCredentialsBucket) {
                    return await rotateCredentials(activeCredentialsBucket)
                  }
                  return null
                }
              : undefined
          }
          onOpenChange={(open) => {
            if (!open) {
              setActiveCredentialsBucket(null)
            }
          }}
        />

        <BucketSettingsDialog
          bucketName={activeSettingsBucket}
          onOpenChange={(open) => {
            if (!open) {
              setActiveSettingsBucket(null)
            }
          }}
        />

        <ObjectOperationsDialog
          bucketName={activeObjectOpsBucket}
          onOpenChange={(open) => {
            if (!open) {
              setActiveObjectOpsBucket(null)
            }
          }}
        />

        <S3ViewerModal
          open={activeViewerBucket !== null}
          bucketName={activeViewerBucket}
          onOpenChange={(open) => {
            if (!open) {
              setActiveViewerBucket(null)
            }
          }}
        />
      </Suspense>
    </section>
  )
}
