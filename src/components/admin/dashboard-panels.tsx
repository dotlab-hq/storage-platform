import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { DEFAULT_PROVIDER_ID } from '@/lib/storage-provider-constants'
import type { AdminProvider, AdminUser } from '@/lib/storage-provider-queries'
import { formatBytes } from '@/lib/format-bytes'
import { UsersTable } from './users-table'

type MetricCardProps = { title: string; value: string | number }

export function MetricCard( { title, value }: MetricCardProps ) {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4 backdrop-blur-sm transition-all duration-300 hover:from-primary/15 hover:via-background hover:to-secondary/15">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        <p className="text-3xl font-bold tracking-tight text-foreground">
          {value}
        </p>
      </div>
    </div>
  )
}

export function ProvidersPanel( {
  providers,
  onToggleAvailability,
  onDelete,
  onEdit,
  onViewContents,
}: {
  providers: AdminProvider[]
  onToggleAvailability: ( providerId: string, isActive: boolean ) => Promise<void>
  onDelete: ( providerId: string ) => Promise<void>
  onEdit: ( provider: AdminProvider ) => void
  onViewContents: ( provider: AdminProvider ) => void
} ) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">
          Storage Providers
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage your storage providers and their configurations
        </p>
      </div>
      <div className="space-y-3">
        {providers.map( ( provider ) => (
          <div
            key={provider.id}
            className="group relative overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-blue-50/40 via-background to-cyan-50/40 p-4 transition-all duration-300 hover:border-border/80 hover:from-blue-50/60 hover:via-background hover:to-cyan-50/60 dark:from-blue-950/20 dark:to-cyan-950/20 dark:hover:from-blue-950/40 dark:hover:to-cyan-950/40"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-foreground">{provider.name}</p>
                <p className="text-xs text-muted-foreground">
                  Storage: {formatBytes( provider.usedStorageBytes )} /{' '}
                  {formatBytes( provider.storageLimitBytes )} • Max file size:{' '}
                  {formatBytes( provider.fileSizeLimitBytes )}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Badge variant={provider.isActive ? 'default' : 'secondary'}>
                  {provider.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onViewContents( provider )
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {provider.id !== DEFAULT_PROVIDER_ID ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onEdit( provider )
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          void onToggleAvailability(
                            provider.id,
                            !provider.isActive,
                          )
                        }}
                      >
                        {provider.isActive
                          ? 'Mark Unavailable'
                          : 'Mark Available'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                        onClick={() => {
                          void onDelete( provider.id )
                        }}
                      >
                        Delete
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) )}
      </div>
    </div>
  )
}

export function UsersPanel( {
  users,
  onUserUpdate,
}: {
  users: AdminUser[]
  onUserUpdate?: () => void
} ) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Users</h2>
        <p className="text-sm text-muted-foreground">
          Manage user accounts, roles, and access permissions
        </p>
      </div>
      <UsersTable users={users} onUserUpdate={onUserUpdate} />
    </div>
  )
}
