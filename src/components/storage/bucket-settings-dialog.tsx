import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import {
  bucketSettingsTabs,
  type BucketSettingsPayload,
  type BucketSettingsTab,
} from '@/components/storage/bucket-settings-types'
import { useBucketSettingsMutation } from '@/components/storage/bucket-settings-mutation'
import { BucketSettingsOverviewTab } from '@/components/storage/bucket-settings-overview-tab'
import { BucketSettingsPermissionsTab } from '@/components/storage/bucket-settings-permissions-tab'
import { BucketSettingsCorsTab } from '@/components/storage/bucket-settings-cors-tab'
import { BucketSettingsVersioningTab } from '@/components/storage/bucket-settings-versioning-tab'

type BucketSettingsDialogProps = {
  bucketName: string | null
  onOpenChange: (open: boolean) => void
}

async function fetchSettings(
  bucketName: string,
): Promise<BucketSettingsPayload> {
  const response = await fetch(
    `/api/storage/s3/bucket-settings?bucketName=${encodeURIComponent(bucketName)}`,
  )
  if (!response.ok) throw new Error('Failed to load bucket settings')
  return response.json()
}

export function BucketSettingsDialog({
  bucketName,
  onOpenChange,
}: BucketSettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<BucketSettingsTab>('overview')

  const query = useQuery({
    queryKey: ['bucket-settings', bucketName],
    queryFn: () => fetchSettings(bucketName ?? ''),
    enabled: bucketName !== null,
  })

  const mutation = useBucketSettingsMutation(bucketName)
  const loading = query.isLoading || mutation.isPending

  return (
    <Dialog open={bucketName !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl border border-emerald-500/20 bg-card shadow-2xl">
        <DialogHeader className="text-left">
          <DialogTitle>Bucket Settings</DialogTitle>
          <DialogDescription>
            {bucketName ? `Configure ${bucketName}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {bucketSettingsTabs.map((tab) => (
            <Button
              key={tab}
              size="sm"
              variant={activeTab === tab ? 'default' : 'outline'}
              className={
                activeTab === tab
                  ? 'shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                  : 'border-emerald-500/30 bg-muted/20 text-emerald-100'
              }
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </Button>
          ))}
        </div>

        {loading && (
          <div className="space-y-2">
            <PageSkeleton variant="compact" className="h-5 w-2/5" />
            <PageSkeleton variant="default" className="h-16" />
          </div>
        )}
        {query.error && (
          <div className="rounded border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-200">
            {query.error.message}
          </div>
        )}
        {mutation.error && (
          <div className="rounded border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-200">
            {mutation.error.message}
          </div>
        )}

        {query.data && activeTab === 'overview' && (
          <BucketSettingsOverviewTab payload={query.data} />
        )}
        {query.data && activeTab === 'permissions' && bucketName && (
          <BucketSettingsPermissionsTab
            bucketName={bucketName}
            payload={query.data}
            onUpdate={mutation.mutate}
            isPending={mutation.isPending}
          />
        )}
        {query.data && activeTab === 'cors' && bucketName && (
          <BucketSettingsCorsTab
            bucketName={bucketName}
            payload={query.data}
            onUpdate={mutation.mutate}
            isPending={mutation.isPending}
          />
        )}
        {query.data && activeTab === 'versioning' && bucketName && (
          <BucketSettingsVersioningTab
            bucketName={bucketName}
            payload={query.data}
            onUpdate={mutation.mutate}
            isPending={mutation.isPending}
          />
        )}

        <DialogFooter className="flex w-full flex-row justify-between">
          <DialogClose asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-emerald-500/30 bg-muted/20 text-emerald-100"
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
