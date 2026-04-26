import { useEffect, useMemo, useState } from 'react'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { BucketManagerDialogs } from '@/components/storage/bucket-manager-dialogs'
import { BucketManagerOverview } from '@/components/storage/bucket-manager-overview'
import { BucketManagerTable } from '@/components/storage/bucket-manager-table'
import { BucketManagerToolbar } from '@/components/storage/bucket-manager-toolbar'
import { useS3Buckets } from '@/hooks/use-s3-buckets'

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
    <section className="space-y-4 rounded-2xl border border-border/80 bg-card/70 p-4 backdrop-blur-sm sm:p-5">
      <div>
        <h2 className="text-base font-semibold tracking-tight">
          Virtual Buckets
        </h2>
        <p className="text-sm text-muted-foreground">
          S3-compatible bucket orchestration with scoped credentials, ACL,
          versioning, and CORS controls.
        </p>
      </div>

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
    </section>
  )
}
