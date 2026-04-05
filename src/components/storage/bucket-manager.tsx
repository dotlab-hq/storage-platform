import { useEffect, useMemo, useState } from "react"
import { Loader2, Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BucketCredentialsDialog } from "@/components/storage/bucket-credentials-dialog"
import { BucketSettingsDialog } from "@/components/storage/bucket-settings-dialog"
import { ObjectOperationsDialog } from "@/components/storage/object-operations-dialog"
import { BucketManagerCard } from "@/components/storage/bucket-manager-card"
import { S3ViewerModal } from "@/components/storage/s3-viewer-modal"
import { useS3Buckets } from "@/hooks/use-s3-buckets"

export function BucketManager() {
    const [bucketName, setBucketName] = useState<string>( "" )
    const [activeCredentialsBucket, setActiveCredentialsBucket] = useState<string | null>( null )
    const [activeSettingsBucket, setActiveSettingsBucket] = useState<string | null>( null )
    const [activeObjectOpsBucket, setActiveObjectOpsBucket] = useState<string | null>( null )
    const [activeViewerBucket, setActiveViewerBucket] = useState<string | null>( null )
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

    const openCredentialsDialog = async ( name: string ) => {
        const credentials = await fetchCredentials( name )
        if ( credentials ) {
            setActiveCredentialsBucket( name )
        }
    }

    const activeCredentials = activeCredentialsBucket
        ? credentialByBucket[activeCredentialsBucket]
        : undefined

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
                        return (
                            <BucketManagerCard
                                key={bucket.name}
                                bucket={bucket}
                                pendingAction={pendingAction}
                                onCredentials={( name ) => { void openCredentialsDialog( name ) }}
                                onView={setActiveViewerBucket}
                                onSettings={setActiveSettingsBucket}
                                onObjectOps={setActiveObjectOpsBucket}
                                onEmpty={( name ) => { void handleEmpty( name ) }}
                                onDelete={( name ) => { void handleDelete( name ) }}
                            />
                        )
                    } )}
                </div>
            )}

            <BucketCredentialsDialog
                bucketName={activeCredentialsBucket}
                credentials={activeCredentials}
                onCopy={copyValue}
                onOpenChange={( open ) => {
                    if ( !open ) {
                        setActiveCredentialsBucket( null )
                    }
                }}
            />

            <BucketSettingsDialog
                bucketName={activeSettingsBucket}
                onOpenChange={( open ) => {
                    if ( !open ) setActiveSettingsBucket( null )
                }}
            />

            <ObjectOperationsDialog
                bucketName={activeObjectOpsBucket}
                onOpenChange={( open ) => {
                    if ( !open ) setActiveObjectOpsBucket( null )
                }}
            />

            <S3ViewerModal
                open={activeViewerBucket !== null}
                bucketName={activeViewerBucket}
                onOpenChange={( open ) => {
                    if ( !open ) {
                        setActiveViewerBucket( null )
                    }
                }}
            />
        </section>
    )
}
