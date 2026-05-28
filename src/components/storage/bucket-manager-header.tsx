export function BucketManagerHeader() {
  return (
    <div className="flex flex-col gap-3 border-b border-border/60 pb-4 lg:flex-row lg:items-end lg:justify-between">
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
      <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs">
        <span className="h-2 w-2 rounded-full bg-foreground/70" />
        <span className="font-medium">Gateway online</span>
        <span className="text-muted-foreground">AWS S3 compatible</span>
      </div>
    </div>
  )
}
