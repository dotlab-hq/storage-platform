import { useEffect, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { S3BucketViewer } from "./s3-bucket-viewer"

type S3ViewerModalProps = {
    open: boolean
    onOpenChange: ( open: boolean ) => void
    bucketName?: string | null
}

export function S3ViewerModal( { open, onOpenChange, bucketName }: S3ViewerModalProps ) {
    const [workingBucketName, setWorkingBucketName] = useState( bucketName ?? "" )

    useEffect( () => {
        setWorkingBucketName( bucketName ?? "" )
    }, [bucketName] )

    const normalizedBucketName = workingBucketName.trim()

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl">
                <DialogHeader>
                    <DialogTitle>S3 Viewer</DialogTitle>
                    <DialogDescription>Interactive file-system viewer with server-side S3 operations.</DialogDescription>
                </DialogHeader>

                {!bucketName ? (
                    <Input
                        value={workingBucketName}
                        onChange={( event ) => setWorkingBucketName( event.target.value )}
                        placeholder="bucket-name"
                    />
                ) : null}

                {normalizedBucketName.length >= 3 ? (
                    <S3BucketViewer bucketName={normalizedBucketName} />
                ) : (
                    <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-sm">
                        Enter a bucket name to open viewer.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
