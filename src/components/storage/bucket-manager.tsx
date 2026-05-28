import { useEffect, useMemo, useState } from 'react'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { BucketManagerCapabilities } from '@/components/storage/bucket-manager-capabilities'
import { BucketManagerDialogs } from '@/components/storage/bucket-manager-dialogs'
import { BucketManagerOverview } from '@/components/storage/bucket-manager-overview'
import { BucketManagerTable } from '@/components/storage/bucket-manager-table'
import { BucketManagerToolbar } from '@/components/storage/bucket-manager-toolbar'
import { useS3Buckets } from '@/hooks/use-s3-buckets'
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog'

export function BucketManager() {
  const [bucketName, setBucketName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
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
  const [pendingEmptyBucket, setPendingEmptyBucket] = useState<string | null>(
    null,
  )
  const [pendingDeleteBucket, setPendingDeleteBucket] = useState<string | null>(
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
  const filteredBuckets = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase()
    if (normalized.length === 0) {
      return buckets
    }
    return buckets.filter((bucket) =>
      bucket.name.toLowerCase().includes(normalized),
    )
  }, [buckets, searchQuery])

  const activeCredentials = activeCredentialsBucket
    ? credentialByBucket[activeCredentialsBucket]
    : undefined

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 border-b border-border pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            S3 Control Plane
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Virtual Buckets
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage S3-compatible buckets, scoped credentials, object browsing,
            lifecycle-safe operations, ACL, versioning, policy, and CORS.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="font-medium">Gateway online</span>
          <span className="text-muted-foreground">AWS S3 compatible</span>
        </div>
      </div>

      <BucketManagerCapabilities />

      <BucketManagerToolbar
        bucketName={bucketName}
        searchQuery={searchQuery}
        isCreating={isCreating}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        createDisabled={createDisabled}
        onBucketNameChange={setBucketName}
        onSearchQueryChange={setSearchQuery}
        onRefresh={refreshBuckets}
        onCreate={async () => {
          const created = await createNewBucket(bucketName)
          if (created) {
            setBucketName('')
          }
        }}
      />

      <BucketManagerOverview
        buckets={buckets}
        filteredBuckets={filteredBuckets}
        defaultBucketName={defaultBucket?.name ?? null}
      />

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

      {!isLoading && filteredBuckets.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          {buckets.length === 0
            ? 'No virtual buckets found for your account.'
            : 'No buckets match your current search.'}
        </div>
      ) : null}

      {!isLoading && filteredBuckets.length > 0 ? (
        <BucketManagerTable
          buckets={filteredBuckets}
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
              setPendingEmptyBucket(name)
            }
          }}
          onDelete={async (name, isDefault) => {
            if (!isDefault) {
              setPendingDeleteBucket(name)
            }
          }}
        />
      ) : null}

      <BucketManagerDialogs
        activeCredentialsBucket={activeCredentialsBucket}
        activeSettingsBucket={activeSettingsBucket}
        activeObjectOpsBucket={activeObjectOpsBucket}
        activeViewerBucket={activeViewerBucket}
        activeCredentials={activeCredentials}
        onCopy={async (value) => navigator.clipboard.writeText(value)}
        onRotate={rotateCredentials}
        onCloseCredentials={() => setActiveCredentialsBucket(null)}
        onCloseSettings={() => setActiveSettingsBucket(null)}
        onCloseObjectOps={() => setActiveObjectOpsBucket(null)}
        onCloseViewer={() => setActiveViewerBucket(null)}
      />

      <ConfirmActionDialog
        open={pendingEmptyBucket !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingEmptyBucket(null)
          }
        }}
        title="Empty bucket?"
        description="This will remove all objects and versions inside the bucket."
        confirmLabel="Empty bucket"
        confirmVariant="destructive"
        requiresConfirmation
        onConfirm={async () => {
          if (pendingEmptyBucket) {
            await runBucketAction(pendingEmptyBucket, 'empty')
            setPendingEmptyBucket(null)
          }
        }}
      />

      <ConfirmActionDialog
        open={pendingDeleteBucket !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteBucket(null)
          }
        }}
        title="Delete this bucket permanently?"
        description="This will remove all objects, versions, and bucket metadata."
        confirmLabel="Delete bucket"
        confirmVariant="destructive"
        requiresConfirmation
        onConfirm={async () => {
          if (pendingDeleteBucket) {
            await runBucketAction(pendingDeleteBucket, 'delete')
            setPendingDeleteBucket(null)
          }
        }}
      />
    </section>
  )
}
