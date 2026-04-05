import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type ObjectOperationsDialogProps = {
    bucketName: string | null
    onOpenChange: ( open: boolean ) => void
}

type ObjectPayload = {
    properties: { name: string, sizeInBytes: number, mimeType: string | null, etag: string | null }
    tags: Array<{ key: string, value: string }>
    acl: "private" | "public-read"
    versions: Array<{ versionId: string, isDeleteMarker: boolean, createdAt: string, etag: string | null, sizeInBytes: number }>
}

export function ObjectOperationsDialog( props: ObjectOperationsDialogProps ) {
    const { bucketName, onOpenChange } = props
    const [objectKey, setObjectKey] = useState( "" )
    const [activeTab, setActiveTab] = useState<"properties" | "tags" | "versions" | "permissions">( "properties" )
    const [draftTags, setDraftTags] = useState<string>( "[]" )
    const queryClient = useQueryClient()

    const query = useQuery( {
        queryKey: ["object-settings", bucketName, objectKey],
        enabled: bucketName !== null && objectKey.trim().length > 0,
        queryFn: async () => {
            const qs = new URLSearchParams( { bucketName: bucketName ?? "", objectKey } ).toString()
            const response = await fetch( `/api/storage/s3/object-settings?${qs}` )
            if ( !response.ok ) throw new Error( "Failed to load object" )
            const payload: ObjectPayload = await response.json()
            return payload
        },
    } )

    const update = useMutation( {
        mutationFn: async ( payload: unknown ) => {
            const response = await fetch( "/api/storage/s3/object-settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify( payload ),
            } )
            if ( !response.ok ) throw new Error( "Update failed" )
        },
        onMutate: async ( payload ) => {
            await queryClient.cancelQueries( { queryKey: ["object-settings", bucketName, objectKey] } )
            const previous = queryClient.getQueryData<ObjectPayload>( ["object-settings", bucketName, objectKey] )
            if ( !previous || typeof payload !== "object" || payload === null || !( "action" in payload ) ) {
                return { previous }
            }

            const actionPayload = payload as { action: string }
            if ( actionPayload.action === "tags" && "tags" in actionPayload ) {
                queryClient.setQueryData<ObjectPayload>( ["object-settings", bucketName, objectKey], { ...previous, tags: actionPayload.tags as ObjectPayload["tags"] } )
            }
            if ( actionPayload.action === "acl" && "cannedAcl" in actionPayload ) {
                queryClient.setQueryData<ObjectPayload>( ["object-settings", bucketName, objectKey], { ...previous, acl: actionPayload.cannedAcl as ObjectPayload["acl"] } )
            }
            return { previous }
        },
        onError: ( _error, _payload, context ) => {
            if ( context?.previous ) {
                queryClient.setQueryData( ["object-settings", bucketName, objectKey], context.previous )
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries( { queryKey: ["object-settings", bucketName, objectKey] } )
        },
    } )

    const tagsPretty = useMemo( () => JSON.stringify( query.data?.tags ?? [], null, 2 ), [query.data?.tags] )

    return (
        <Dialog open={bucketName !== null} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Object Operations</DialogTitle>
                    <DialogDescription>{bucketName ? `Manage object in ${bucketName}` : ""}</DialogDescription>
                </DialogHeader>

                <Input value={objectKey} onChange={( e ) => setObjectKey( e.target.value )} placeholder="path/to/object.txt" />

                <div className="flex gap-2">
                    <Button size="sm" variant={activeTab === "properties" ? "default" : "outline"} onClick={() => setActiveTab( "properties" )}>Properties</Button>
                    <Button size="sm" variant={activeTab === "tags" ? "default" : "outline"} onClick={() => setActiveTab( "tags" )}>Tags</Button>
                    <Button size="sm" variant={activeTab === "versions" ? "default" : "outline"} onClick={() => setActiveTab( "versions" )}>Versions</Button>
                    <Button size="sm" variant={activeTab === "permissions" ? "default" : "outline"} onClick={() => setActiveTab( "permissions" )}>Permissions</Button>
                </div>

                {query.error && <div className="rounded border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">{query.error.message}</div>}
                {update.error && <div className="rounded border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">{update.error.message}</div>}

                {query.data && activeTab === "properties" && (
                    <div className="space-y-1 text-sm">
                        <p>Name: {query.data.properties.name}</p>
                        <p>Size: {query.data.properties.sizeInBytes}</p>
                        <p>Type: {query.data.properties.mimeType ?? "unknown"}</p>
                        <p>ETag: {query.data.properties.etag ?? "-"}</p>
                    </div>
                )}

                {query.data && activeTab === "tags" && (
                    <div className="space-y-2">
                        <textarea aria-label="Object tags JSON" className="h-36 w-full rounded border p-2 text-xs" value={draftTags || tagsPretty} onChange={( e ) => setDraftTags( e.target.value )} />
                        <Button size="sm" onClick={() => update.mutate( { action: "tags", bucketName, objectKey, tags: JSON.parse( draftTags || tagsPretty ) } )}>Save Tags</Button>
                    </div>
                )}

                {query.data && activeTab === "versions" && (
                    <div className="max-h-56 space-y-2 overflow-auto text-xs">
                        {query.data.versions.map( ( version ) => (
                            <div key={version.versionId} className="rounded border p-2">
                                <p>{version.versionId}</p>
                                <p>{version.createdAt}</p>
                                <p>{version.isDeleteMarker ? "Delete marker" : `Size ${version.sizeInBytes}`}</p>
                                {!version.isDeleteMarker && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="mt-2"
                                        onClick={() => update.mutate( { action: "restore", bucketName, objectKey, versionId: version.versionId } )}
                                    >
                                        Restore
                                    </Button>
                                )}
                            </div>
                        ) )}
                    </div>
                )}

                {query.data && activeTab === "permissions" && (
                    <div className="space-y-2">
                        <p className="text-sm">Current ACL: {query.data.acl}</p>
                        <Button size="sm" onClick={() => update.mutate( { action: "acl", bucketName, objectKey, cannedAcl: query.data.acl === "private" ? "public-read" : "private" } )}>
                            Toggle ACL
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
