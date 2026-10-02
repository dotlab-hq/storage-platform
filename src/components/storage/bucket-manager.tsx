import { useState } from 'react'
import { BucketManagerDialogs } from '@/components/storage/bucket-manager-dialogs'
import type { BucketDialog } from '@/components/storage/bucket-manager-dialogs'
import { BucketManagerOverview } from '@/components/storage/bucket-manager-overview'
import { BucketManagerTable } from '@/components/storage/bucket-manager-table'
import { BucketManagerToolbar } from '@/components/storage/bucket-manager-toolbar'
import { BucketManagerConfirmDialogs } from '@/components/storage/bucket-manager-confirm-dialogs'
import { useS3Buckets } from '@/hooks/use-s3-buckets'

/** Heading block shared by the buckets page and its skeleton. */
export function BucketManagerIntro() {
  return (
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
    </div>
  )
}

/** The /buckets page body: toolbar, stats, bucket table and its dialogs. */
export function BucketManager() {
  const [bucketName, setBucketName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [openDialog, setOpenDialog] = useState<BucketDialog | null>(null)
  const [pendingEmptyBucket, setPendingEmptyBucket] = useState<string | null>(
    null,
  )
  const [pendingDeleteBucket, setPendingDeleteBucket] = useState<string | null>(
    null,
  )

  const {
    buckets,
    defaultBucket,
    isCreating,
    pendingByBucket,
    credentialByBucket,
    refreshBuckets,
    createBucket,
    runBucketAction,
    fetchCredentials,
    rotateCredentials,
  } = useS3Buckets()

  const normalizedSearch = searchQuery.trim().toLowerCase()
  const filteredBuckets = normalizedSearch
    ? buckets.filter((bucket) =>
        bucket.name.toLowerCase().includes(normalizedSearch),
      )
    : buckets

  const refresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshBuckets()
    } finally {
      setIsRefreshing(false)
    }
  }

  const create = async () => {
    if (await createBucket(bucketName)) setBucketName('')
  }

  const openCredentials = async (name: string) => {
    if (await fetchCredentials(name)) {
      setOpenDialog({ kind: 'credentials', bucketName: name })
    }
  }

  return (
    <section className="space-y-5">
      <BucketManagerIntro />

      <BucketManagerToolbar
        bucketName={bucketName}
        searchQuery={searchQuery}
        isCreating={isCreating}
        isRefreshing={isRefreshing}
        createDisabled={bucketName.trim().length < 3 || isCreating}
        onBucketNameChange={setBucketName}
        onSearchQueryChange={setSearchQuery}
        onRefresh={refresh}
        onCreate={create}
      />

      <BucketManagerOverview
        buckets={buckets}
        filteredBuckets={filteredBuckets}
        defaultBucketName={defaultBucket?.name ?? null}
      />

      {filteredBuckets.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          {buckets.length === 0
            ? 'No virtual buckets found for your account.'
            : 'No buckets match your current search.'}
        </div>
      ) : (
        <BucketManagerTable
          buckets={filteredBuckets}
          pendingByBucket={pendingByBucket}
          onView={(name) => setOpenDialog({ kind: 'viewer', bucketName: name })}
          onSettings={(name) =>
            setOpenDialog({ kind: 'settings', bucketName: name })
          }
          onObjectOps={(name) =>
            setOpenDialog({ kind: 'objectOps', bucketName: name })
          }
          onCredentials={openCredentials}
          onEmpty={(name, isDefault) => {
            if (!isDefault) setPendingEmptyBucket(name)
          }}
          onDelete={(name, isDefault) => {
            if (!isDefault) setPendingDeleteBucket(name)
          }}
        />
      )}

      <BucketManagerDialogs
        dialog={openDialog}
        credentials={
          openDialog?.kind === 'credentials'
            ? credentialByBucket[openDialog.bucketName]
            : undefined
        }
        isDefaultBucket={openDialog?.bucketName === defaultBucket?.name}
        onRotate={rotateCredentials}
        onClose={() => setOpenDialog(null)}
      />

      <BucketManagerConfirmDialogs
        pendingEmptyBucket={pendingEmptyBucket}
        pendingDeleteBucket={pendingDeleteBucket}
        onClearEmpty={() => setPendingEmptyBucket(null)}
        onClearDelete={() => setPendingDeleteBucket(null)}
        onRunAction={runBucketAction}
      />
    </section>
  )
}
