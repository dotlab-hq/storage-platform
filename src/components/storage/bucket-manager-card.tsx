import { Eraser, KeyRound, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { S3BucketItem } from "@/types/s3-buckets"

type BucketManagerCardProps = {
    bucket: S3BucketItem
    pendingAction: "empty" | "delete" | undefined
    onCredentials: ( name: string ) => void
    onSettings: ( name: string ) => void
    onObjectOps: ( name: string ) => void
    onEmpty: ( name: string ) => void
    onDelete: ( name: string ) => void
}

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

export function BucketManagerCard( props: BucketManagerCardProps ) {
    const { bucket, pendingAction, onCredentials, onSettings, onObjectOps, onEmpty, onDelete } = props
    const isPending = typeof pendingAction === "string"

    return (
        <article className="rounded-lg border p-4">
            <div className="space-y-1">
                <p className="truncate text-sm font-semibold">{bucket.name}</p>
                <p className="text-muted-foreground text-xs">Created: {formatCreatedAt( bucket.createdAt )}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => { window.location.href = `/buckets/${encodeURIComponent( bucket.name )}` }}>
                    View Files
                </Button>
                <Button variant="outline" size="sm" disabled={isPending} onClick={() => onCredentials( bucket.name )}>
                    <KeyRound className="h-4 w-4" />
                    Credentials
                </Button>
                <Button variant="outline" size="sm" disabled={isPending} onClick={() => onSettings( bucket.name )}>
                    Settings
                </Button>
                <Button variant="outline" size="sm" disabled={isPending} onClick={() => onObjectOps( bucket.name )}>
                    Object Ops
                </Button>
                <Button variant="outline" size="sm" disabled={isPending} onClick={() => onEmpty( bucket.name )}>
                    {pendingAction === "empty" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eraser className="h-4 w-4" />}
                    Empty
                </Button>
                <Button variant="destructive" size="sm" disabled={isPending} onClick={() => onDelete( bucket.name )}>
                    {pendingAction === "delete" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Delete
                </Button>
            </div>
        </article>
    )
}
