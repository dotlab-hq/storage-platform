import {
  Braces,
  DatabaseZap,
  FileLock2,
  GitBranch,
  KeyRound,
  ShieldCheck,
} from 'lucide-react'

const CAPABILITIES = [
  { label: 'SigV4 auth', icon: KeyRound },
  { label: 'Object CRUD', icon: DatabaseZap },
  { label: 'Multipart', icon: GitBranch },
  { label: 'ACL and CORS', icon: ShieldCheck },
  { label: 'Versioning', icon: FileLock2 },
  { label: 'Policy JSON', icon: Braces },
] as const

export function BucketManagerCapabilities() {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
      {CAPABILITIES.map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.label}
            className="flex min-h-16 items-center gap-3 rounded-lg border border-emerald-500/20 bg-background px-3 py-2 shadow-sm"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/20 text-primary">
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
