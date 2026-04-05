import { useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
    createS3ViewerPresignUrlFn,
    deleteS3ViewerObjectFn,
    getS3ViewerCredentialsFn,
    listS3ViewerObjectsFn,
    uploadS3ViewerObjectFn,
} from "@/lib/storage/mutations/s3-viewer"

type S3ViewerModalProps = {
    open: boolean
    onOpenChange: ( open: boolean ) => void
    defaultBucketName?: string
}

type ViewerTab = "credentials" | "list" | "delete" | "upload" | "presign"

async function fileToBase64( file: File ): Promise<string> {
    const bytes = await file.arrayBuffer()
    let binary = ""
    const view = new Uint8Array( bytes )
    for ( const byte of view ) {
        binary += String.fromCharCode( byte )
    }
    return btoa( binary )
}

export function S3ViewerModal( { open, onOpenChange, defaultBucketName }: S3ViewerModalProps ) {
    const [tab, setTab] = useState<ViewerTab>( "credentials" )
    const [bucketName, setBucketName] = useState( defaultBucketName ?? "" )
    const [prefix, setPrefix] = useState( "" )
    const [objectKey, setObjectKey] = useState( "" )
    const [expiresInSeconds, setExpiresInSeconds] = useState( "900" )
    const [uploadFile, setUploadFile] = useState<File | null>( null )
    const [busy, setBusy] = useState( false )
    const [result, setResult] = useState<string>( "" )

    useEffect( () => {
        setBucketName( defaultBucketName ?? "" )
    }, [defaultBucketName] )

    const normalizedBucket = useMemo( () => bucketName.trim(), [bucketName] )
    const canRun = normalizedBucket.length >= 3 && !busy

    const run = async ( executor: () => Promise<string> ) => {
        if ( !canRun ) {
            setResult( "Enter a valid bucket name first" )
            return
        }
        setBusy( true )
        try {
            const output = await executor()
            setResult( output )
        } catch ( error ) {
            setResult( error instanceof Error ? error.message : "Operation failed" )
        } finally {
            setBusy( false )
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>S3 Viewer</DialogTitle>
                    <DialogDescription>Credentials, list, upload, delete and presigned URLs for one bucket.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-2 sm:grid-cols-2">
                    <Input value={bucketName} onChange={( event ) => setBucketName( event.target.value )} placeholder="bucket-name" />
                    <Input value={prefix} onChange={( event ) => setPrefix( event.target.value )} placeholder="prefix (optional for list)" />
                </div>

                <div className="flex flex-wrap gap-2">
                    {( ["credentials", "list", "delete", "upload", "presign"] as ViewerTab[] ).map( ( value ) => (
                        <Button key={value} size="sm" variant={tab === value ? "default" : "outline"} onClick={() => setTab( value )}>
                            {value}
                        </Button>
                    ) )}
                </div>

                <div className="space-y-2 rounded-lg border p-3">
                    {tab === "credentials" && (
                        <Button disabled={!canRun} onClick={() => void run( async () => JSON.stringify( await getS3ViewerCredentialsFn( { data: { bucketName: normalizedBucket } } ), null, 2 ) )}>
                            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Get Credentials
                        </Button>
                    )}

                    {tab === "list" && (
                        <Button disabled={!canRun} onClick={() => void run( async () => JSON.stringify( await listS3ViewerObjectsFn( { data: { bucketName: normalizedBucket, prefix, maxKeys: 200 } } ), null, 2 ) )}>
                            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            List Objects
                        </Button>
                    )}

                    {tab === "delete" && (
                        <>
                            <Input value={objectKey} onChange={( event ) => setObjectKey( event.target.value )} placeholder="object key to delete" />
                            <Button disabled={!canRun || objectKey.trim().length === 0} onClick={() => void run( async () => {
                                await deleteS3ViewerObjectFn( { data: { bucketName: normalizedBucket, objectKey } } )
                                return `Deleted: ${objectKey}`
                            } )}>
                                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                Delete Object
                            </Button>
                        </>
                    )}

                    {tab === "upload" && (
                        <>
                            <Input value={objectKey} onChange={( event ) => setObjectKey( event.target.value )} placeholder="object key for upload" />
                            <Input type="file" onChange={( event ) => setUploadFile( event.target.files?.[0] ?? null )} />
                            <Button disabled={!canRun || objectKey.trim().length === 0 || uploadFile === null} onClick={() => void run( async () => {
                                if ( uploadFile === null ) throw new Error( "Choose a file to upload" )
                                const contentBase64 = await fileToBase64( uploadFile )
                                const output = await uploadS3ViewerObjectFn( {
                                    data: {
                                        bucketName: normalizedBucket,
                                        objectKey,
                                        contentBase64,
                                        contentType: uploadFile.type,
                                    },
                                } )
                                return `Uploaded ${output.uploadedBytes} bytes to ${objectKey}`
                            } )}>
                                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                Upload Object
                            </Button>
                        </>
                    )}

                    {tab === "presign" && (
                        <>
                            <Input value={objectKey} onChange={( event ) => setObjectKey( event.target.value )} placeholder="object key for presign URL" />
                            <Input value={expiresInSeconds} onChange={( event ) => setExpiresInSeconds( event.target.value )} placeholder="expiry in seconds (60-3600)" />
                            <Button disabled={!canRun || objectKey.trim().length === 0} onClick={() => void run( async () => {
                                const expires = Number( expiresInSeconds )
                                const output = await createS3ViewerPresignUrlFn( {
                                    data: { bucketName: normalizedBucket, objectKey, expiresInSeconds: Number.isFinite( expires ) ? expires : 900 },
                                } )
                                return output.url
                            } )}>
                                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                Generate Presigned URL
                            </Button>
                        </>
                    )}
                </div>

                <pre className="max-h-72 overflow-auto rounded-lg border bg-muted/20 p-3 text-xs whitespace-pre-wrap">{result || "Run an action to see output"}</pre>
            </DialogContent>
        </Dialog>
    )
}
