import { cn } from '@/lib/utils'

/** Grid classes shared by the real grid and its skeleton (keeps them aligned). */
export const FILE_GRID_CLASS =
  'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'

export function FileCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'border-muted/40 bg-card relative h-32 overflow-hidden rounded-xl border p-4',
        className,
      )}
    >
      <div className="bg-muted mb-4 size-10 animate-pulse rounded-lg" />
      <div className="space-y-2.5">
        <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
        <div className="bg-muted h-3 w-1/2 animate-pulse rounded" />
      </div>
    </div>
  )
}

export function FileGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading files" className={FILE_GRID_CLASS}>
      {Array.from({ length: count }, (_, index) => (
        <FileCardSkeleton key={index} />
      ))}
    </div>
  )
}
