import { PageSkeleton } from '@/components/ui/page-skeleton'

export function BucketsPageSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <PageSkeleton className="h-8 w-32" />
        <PageSkeleton className="h-9 w-24" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <PageSkeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  )
}
