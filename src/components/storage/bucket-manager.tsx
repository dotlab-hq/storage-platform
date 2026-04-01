import { useEffect, useMemo, useState } from "react"
import { Copy, Eraser, KeyRound, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useS3Buckets } from "@/hooks/use-s3-buckets"

function formatCreatedAt( value: string | null ): string {
    if ( !value ) {
        return "Unknown"
    }

    const date = new Date( value )
    if ( Number.isNaN( date.getTime() ) ) {
        return "Unknown"
    }

    return date.toLocaleString()
}

export function BucketManager() {
    const [bucketName, setBucketName] = useState<string>( "" )
    const {
        buckets,
        isLoading,
        isRefreshing,
        isCreating,
        pendingByBucket,
        credentialByBucket,
        error,
        hasBuckets,
        refreshBuckets,
        createNewBucket,
        runBucketAction,
        fetchCredentials,
    } = useS3Buckets()

    useEffect( () => {
        void refreshBuckets()
    }, [refreshBuckets] )

    const createDisabled = useMemo( () => {
        return bucketName.trim().length < 3 || isCreating
    }, [bucketName, isCreating] )

    const handleCreate = async () => {
        const created = await createNewBucket( bucketName )
        if ( created ) {
            setBucketName( "" )
        }
    }

    const handleEmpty = async ( name: string ) => {
        const confirmed = window.confirm( `Empty all objects in bucket "${name}"?` )
        if ( !confirmed ) {
            return
        }
        await runBucketAction( name, "empty" )
    }

    const handleDelete = async ( name: string ) => {
        const confirmed = window.confirm( `Delete bucket "${name}"? Bucket must be empty.` )
        if ( !confirmed ) {
            return
        }
        await runBucketAction( name, "delete" )
    }

    const copyValue = async ( value: string ) => {
        await navigator.clipboard.writeText( value )
    }

    return (
        <section className="space-y-4 rounded-xl border bg-card/70 p-4 shadow-sm backdrop-blur-sm sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-base font-semibold">S3 Buckets</h2>
                    <p className="text-muted-foreground text-sm">Create virtual buckets and issue platform credentials. Files are tracked in your platform bucket mapping.</p>
                </div>
                <Button variant="outline" onClick={() => void refreshBuckets()} disabled={isRefreshing || isLoading}>
                    {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    Refresh
                </Button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                    value={bucketName}
                    onChange={( event ) => setBucketName( event.target.value )}
                    placeholder="new-bucket-name"
                    className="sm:max-w-sm"
                />
                <Button onClick={() => void handleCreate()} disabled={createDisabled}>
                    {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Create Bucket
                </Button>
            </div>

            {error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                </div>
            )}

            {isLoading && (
                <div className="text-muted-foreground py-8 text-sm">Loading buckets...</div>
            )}

            {!isLoading && !hasBuckets && (
                <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-sm">
                    No virtual buckets found for your account.
                </div>
            )}

            {!isLoading && hasBuckets && (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {buckets.map( ( bucket ) => {
                        const pendingAction = pendingByBucket[bucket.name]
                        const isPending = typeof pendingAction === "string"
                        return (
                            <article key={bucket.name} className="rounded-lg border p-4">
                                <div className="space-y-1">
                                    <p className="truncate text-sm font-semibold">{bucket.name}</p>
                                    <p className="text-muted-foreground text-xs">Created: {formatCreatedAt( bucket.createdAt )}</p>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={isPending}
                                        onClick={() => void fetchCredentials( bucket.name )}
                                    >
                                        <KeyRound className="h-4 w-4" />
                                        Credentials
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={isPending}
                                        onClick={() => void handleEmpty( bucket.name )}
                                    >
                                        {pendingAction === "empty" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eraser className="h-4 w-4" />}
                                        Empty
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        disabled={isPending}
                                        onClick={() => void handleDelete( bucket.name )}
                                    >
                                        {pendingAction === "delete" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        Delete
                                    </Button>
                                </div>
                                {credentialByBucket[bucket.name] && (
                                    <div className="bg-muted/50 mt-3 space-y-2 rounded-md border p-3 text-xs">
                                        <div className="space-y-1">
                                            <p className="text-muted-foreground">Access Key ID</p>
                                            <div className="flex items-center gap-2">
                                                <p className="truncate font-mono">{credentialByBucket[bucket.name]?.accessKeyId}</p>
                                                <Button size="icon-xs" variant="ghost" onClick={() => void copyValue( credentialByBucket[bucket.name]?.accessKeyId ?? "" )}>
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-muted-foreground">Secret Access Key</p>
                                            <div className="flex items-center gap-2">
                                                <p className="truncate font-mono">{credentialByBucket[bucket.name]?.secretAccessKey}</p>
                                                <Button size="icon-xs" variant="ghost" onClick={() => void copyValue( credentialByBucket[bucket.name]?.secretAccessKey ?? "" )}>
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </article>
                        )
                    } )}
                </div>
            )}
        </section>
    )
}
