import { cn } from '@/lib/utils'

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-muted/40 bg-card p-4 h-32',
        className,
      )}
    >
      {/* Icon placeholder with shimmer */}
      <div className="mb-4 inline-flex">
        <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
      </div>

      {/* Text content skeleton with shimmer */}
      <div className="space-y-2.5">
        {/* File name - larger text */}
        <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />

        {/* File metadata - smaller text */}
        <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 animate-in fade-in duration-500">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={`skeleton-${i}`} />
      ))}
    </div>
  )
}
