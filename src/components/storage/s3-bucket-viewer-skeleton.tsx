function Block({ className }: { className: string }) {
  return <div className={`bg-muted/50 animate-pulse rounded-md ${className}`} />
}

/** Placeholder rows for a bucket listing that has not loaded yet. */
export function S3ViewerRowsSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 4 }, (_, index) => (
        <Block key={index} className="h-12" />
      ))}
    </div>
  )
}

/** Same frame as `S3BucketViewer`, used while the bucket page loads. */
export function S3BucketViewerSkeleton() {
  return (
    <section className="flex h-full flex-col rounded-xl border border-border/60 bg-background/70 p-4 shadow-lg">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Block className="h-8 w-32 rounded-full" />
        <div className="flex items-center gap-2">
          <Block className="h-8 w-24" />
          <Block className="h-8 w-28" />
          <Block className="h-8 w-24" />
        </div>
      </div>
      <div className="flex-1 rounded-lg border border-border/60 bg-background/60">
        <S3ViewerRowsSkeleton />
      </div>
      <div className="pt-3">
        <Block className="h-5 w-16" />
      </div>
    </section>
  )
}
