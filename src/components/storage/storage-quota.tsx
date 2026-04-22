import { Progress } from '@/components/ui/progress'
import { formatFileSize } from '@/lib/file-utils'
import { cn } from '@/lib/utils'
import type { UserQuota } from '@/types/storage'

type StorageQuotaProps = {
  quota: UserQuota | null
  className?: string
}

export function StorageQuota({ quota, className }: StorageQuotaProps) {
  if (!quota) {
    return (
      <div className={cn('space-y-2 px-2', className)}>
        <div className="bg-muted h-3 w-24 animate-pulse rounded" />
        <div className="bg-muted h-2 w-full animate-pulse rounded-full" />
      </div>
    )
  }

  const usedStorage = Number.isFinite(quota.usedStorage)
    ? Math.max(0, quota.usedStorage)
    : 0
  const allocatedStorage = Number.isFinite(quota.allocatedStorage)
    ? Math.max(0, quota.allocatedStorage)
    : 0
  const fileSizeLimit = Number.isFinite(quota.fileSizeLimit)
    ? Math.max(0, quota.fileSizeLimit)
    : 0
  const percentage =
    allocatedStorage > 0 ? (usedStorage / allocatedStorage) * 100 : 0
  const isWarning = percentage >= 80
  const isDanger = percentage >= 95

  return (
    <div className={cn('space-y-2 px-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-medium">
          Storage
        </span>
        <span
          className={cn(
            'text-xs font-medium',
            isDanger && 'text-destructive',
            isWarning && !isDanger && 'text-amber-500',
          )}
        >
          {formatFileSize(usedStorage)} / {formatFileSize(allocatedStorage)}
        </span>
      </div>
      <Progress
        value={percentage}
        max={100}
        className={cn(
          'h-1.5',
          isDanger && 'bg-destructive/20',
          isWarning && !isDanger && 'bg-amber-500/20',
        )}
      />
      <p className="text-muted-foreground text-[10px]">
        Max file size: {formatFileSize(fileSizeLimit)}
      </p>
      {isWarning && (
        <p
          className={cn(
            'text-[10px]',
            isDanger ? 'text-destructive' : 'text-amber-500',
          )}
        >
          {isDanger
            ? 'Storage almost full. Free up space.'
            : "You're running low on space."}
        </p>
      )}
    </div>
  )
}
