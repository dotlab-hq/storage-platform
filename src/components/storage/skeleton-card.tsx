import { cn } from "@/lib/utils"

export function SkeletonCard( { className }: { className?: string } ) {
    return (
        <div
            className={cn(
                "bg-card relative overflow-hidden rounded-xl border p-4",
                className
            )}
        >
            {/* shimmer overlay */}
            <div className="skeleton-shimmer absolute inset-0" />
            <div className="bg-muted mb-3 h-10 w-10 rounded-lg" />
            <div className="space-y-2">
                <div className="bg-muted h-4 w-3/4 rounded" />
                <div className="bg-muted h-3 w-1/2 rounded" />
            </div>
        </div>
    )
}

export function SkeletonGrid( { count = 8 }: { count?: number } ) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from( { length: count } ).map( ( _, i ) => (
                <SkeletonCard key={`skeleton-${i}`} />
            ) )}
        </div>
    )
}
