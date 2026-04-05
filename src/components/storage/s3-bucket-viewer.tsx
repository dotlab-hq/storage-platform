import { Eye, FolderPlus, Loader2, RefreshCw, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { S3ViewerFileCard, S3ViewerFolderCard } from "@/components/storage/s3-bucket-viewer-cards"
import { useS3BucketViewer } from "@/components/storage/use-s3-bucket-viewer"

type S3BucketViewerProps = {
    bucketName: string
}

export function S3BucketViewer( { bucketName }: S3BucketViewerProps ) {
    const viewer = useS3BucketViewer( bucketName )

    return (
        <section className="space-y-4 rounded-xl border bg-card/70 p-4 shadow-sm backdrop-blur-sm sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h3 className="text-base font-semibold">Bucket Viewer</h3>
                    <p className="text-muted-foreground text-xs">{bucketName} {viewer.prefix ? ` / ${viewer.prefix}` : ""}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" disabled={viewer.busy} onClick={() => void viewer.refresh()}>
                        {viewer.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}Refresh
                    </Button>
                    <Button type="button" variant="outline" size="sm" disabled={viewer.busy} onClick={() => void viewer.showCredentials()}>
                        <Eye className="h-4 w-4" />Credentials
                    </Button>
                    <Button type="button" variant="outline" size="sm" disabled={viewer.busy} onClick={() => void viewer.createFolder()}>
                        <FolderPlus className="h-4 w-4" />Folder
                    </Button>
                    <Button type="button" variant="outline" size="sm" disabled={viewer.busy} onClick={() => viewer.inputRef.current?.click()}>
                        <Upload className="h-4 w-4" />Upload
                    </Button>
                    <Input ref={viewer.inputRef} className="hidden" type="file" onChange={( event ) => { void viewer.handleUpload( event ) }} />
                </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
                <Button type="button" size="sm" variant="ghost" onClick={() => void viewer.refresh( "" )}>root</Button>
                {viewer.breadcrumbs.map( ( crumb ) => (
                    <Button key={crumb.value} type="button" size="sm" variant="ghost" onClick={() => void viewer.refresh( crumb.value )}>
                        {crumb.label}
                    </Button>
                ) )}
            </div>

            {viewer.message ? <div className="rounded-md border px-3 py-2 text-xs whitespace-pre-wrap">{viewer.message}</div> : null}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {viewer.folders.map( ( folder ) => (
                    <S3ViewerFolderCard
                        key={folder.prefix}
                        entry={folder}
                        onOpen={( targetPrefix ) => {
                            void viewer.refresh( targetPrefix )
                        }}
                        onSelect={viewer.setPrefix}
                    />
                ) )}
                {viewer.files.map( ( file ) => (
                    <S3ViewerFileCard
                        key={file.key}
                        entry={file}
                        onOpen={( key ) => {
                            void viewer.openFile( key )
                        }}
                        onDelete={( key ) => {
                            void viewer.deleteFile( key )
                        }}
                    />
                ) )}
            </div>

            {viewer.folders.length === 0 && viewer.files.length === 0 && !viewer.busy ? (
                <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-sm">No objects found in this prefix.</div>
            ) : null}
        </section>
    )
}
