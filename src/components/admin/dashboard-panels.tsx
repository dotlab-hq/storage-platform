import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DEFAULT_PROVIDER_ID } from "@/lib/storage-provider-constants"
import type { AdminProvider, AdminUser } from "@/lib/storage-provider-queries"
import { formatBytes } from "@/lib/format-bytes"

type MetricCardProps = { title: string; value: string | number }

export function MetricCard( { title, value }: MetricCardProps ) {
    return (
        <div className="rounded-lg border bg-card p-4">
            <p className="text-muted-foreground text-sm">{title}</p>
            <p className="text-2xl font-semibold">{value}</p>
        </div>
    )
}

export function ProvidersPanel( {
    providers,
    onToggleAvailability,
    onDelete,
}: {
    providers: AdminProvider[]
    onToggleAvailability: (providerId: string, isActive: boolean) => Promise<void>
    onDelete: (providerId: string) => Promise<void>
} ) {
    return (
        <div className="rounded-lg border bg-card p-4">
            <h2 className="mb-3 text-base font-semibold">Storage Providers</h2>
            <div className="space-y-3">
                {providers.map( ( provider ) => (
                    <div key={provider.id} className="rounded border p-3">
                        <div className="flex items-center justify-between">
                            <p className="font-medium">{provider.name}</p>
                            <div className="flex gap-2">
                                <Badge variant={provider.isActive ? "default" : "secondary"}>
                                    {provider.isActive ? "Active" : "Inactive"}
                                </Badge>
                                {provider.id !== DEFAULT_PROVIDER_ID ? (
                                    <>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                void onToggleAvailability( provider.id, !provider.isActive )
                                            }}
                                        >
                                            {provider.isActive ? "Mark Unavailable" : "Mark Available"}
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
                        <p className="text-muted-foreground text-xs">
                            {formatBytes( provider.usedStorageBytes )} / {formatBytes( provider.storageLimitBytes )}
                        </p>
                        <p className="text-muted-foreground text-xs">
                            Available: {formatBytes( provider.availableStorageBytes )}
                        </p>
                    </div>
                ) )}
            </div>
        </div>
    )
}

export function UsersPanel( { users }: { users: AdminUser[] } ) {
    return (
        <div className="rounded-lg border bg-card p-4">
            <h2 className="mb-3 text-base font-semibold">Users</h2>
            <div className="space-y-2">
                {users.map( ( user ) => (
                    <div key={user.id} className="flex items-center justify-between rounded border p-2">
                        <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-muted-foreground text-xs">{user.email}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs">{formatBytes( user.usedStorage )}</p>
                            {user.isAdmin ? <Badge variant="outline">Admin</Badge> : null}
                        </div>
                    </div>
                ) )}
            </div>
        </div>
    )
}
