import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import type { S3BucketCredentials } from "@/types/s3-buckets"

type BucketCredentialsDialogProps = {
    bucketName: string | null
    credentials: S3BucketCredentials | undefined
    onOpenChange: ( open: boolean ) => void
    onCopy: ( value: string ) => Promise<void>
}

export function BucketCredentialsDialog( props: BucketCredentialsDialogProps ) {
    const { bucketName, credentials, onOpenChange, onCopy } = props

    return (
        <Dialog open={bucketName !== null} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Bucket Credentials</DialogTitle>
                    <DialogDescription>
                        {bucketName ? `Virtual bucket: ${bucketName}` : ""}
                    </DialogDescription>
                </DialogHeader>
                {credentials && (
                    <div className="space-y-3 text-xs">
                        <div className="space-y-1">
                            <p className="text-muted-foreground">Access Key ID</p>
                            <div className="flex items-center gap-2">
                                <p className="truncate font-mono">{credentials.accessKeyId}</p>
                                <Button size="icon-xs" variant="ghost" onClick={() => void onCopy( credentials.accessKeyId )}>
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-muted-foreground">Secret Access Key</p>
                            <div className="flex items-center gap-2">
                                <p className="truncate font-mono">{credentials.secretAccessKey}</p>
                                <Button size="icon-xs" variant="ghost" onClick={() => void onCopy( credentials.secretAccessKey )}>
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                        <p className="text-muted-foreground">Bucket: {credentials.bucket}</p>
                        <p className="text-muted-foreground">S3 Endpoint: {credentials.endpoint}</p>
                        <p className="text-muted-foreground">Region: auto</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
