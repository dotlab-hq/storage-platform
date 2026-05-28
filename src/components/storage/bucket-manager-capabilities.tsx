import { DatabaseZap, FileLock2, GitBranch, ShieldCheck } from 'lucide-react'

const CAPABILITIES = [
  { label: 'Object CRUD', icon: DatabaseZap },
  { label: 'Multipart', icon: GitBranch },
  { label: 'ACL and CORS', icon: ShieldCheck },
  { label: 'Versioning', icon: FileLock2 },
] as const

export function BucketManagerCapabilities() {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {CAPABILITIES.map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.label}
            className="flex min-h-16 items-center gap-3 rounded-lg border border-border/60 bg-background/60 px-3 py-2 shadow-sm"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/40 text-foreground">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">Gateway-ready</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
