"use client"

import * as React from "react"
import { createClientOnlyFn } from "@tanstack/react-start"
import { Upload, X } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { uploadBatch } from "@/lib/upload-utils"
import { toast } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import type { StorageItem, UploadingFile } from "@/types/storage"

type UploadDialogProps = {
    open: boolean
    onOpenChange: ( open: boolean ) => void
    userId: string | null
    currentFolderId: string | null
    setUploads: React.Dispatch<React.SetStateAction<UploadingFile[]>>
    onUploadComplete: () => Promise<void> | void
    setItems?: React.Dispatch<React.SetStateAction<StorageItem[]>>
}

export function UploadDialog( {
    open,
    onOpenChange,
    userId,
    currentFolderId,
    setUploads,
    onUploadComplete,
    setItems,
}: UploadDialogProps ) {
    const inputRef = React.useRef<HTMLInputElement>( null )
    const [isDragging, setIsDragging] = React.useState( false )
    const [selectedFiles, setSelectedFiles] = React.useState<File[]>( [] )
    const [uploadError, setUploadError] = React.useState<string | null>( null )

    React.useEffect( () => {
        if ( !open ) { setSelectedFiles( [] ); setUploadError( null ) }
    }, [open] )

    const dedupeAndAppend = React.useCallback( ( incoming: File[] ) => {
        setSelectedFiles( ( cur ) => {
            const existing = new Set(
                cur.map( ( f ) => `${f.name}-${f.size}-${f.lastModified}` )
            )
            const additions = incoming.filter(
                ( f ) => !existing.has( `${f.name}-${f.size}-${f.lastModified}` )
            )
            return [...cur, ...additions]
        } )
    }, [] )

    const handleDrop = ( e: React.DragEvent<HTMLDivElement> ) => {
        e.preventDefault()
        setIsDragging( false )
        const files = Array.from( e.dataTransfer.files )
        if ( files.length ) dedupeAndAppend( files )
    }

    const handleInputChange = ( e: React.ChangeEvent<HTMLInputElement> ) => {
        const files = e.target.files ? Array.from( e.target.files ) : []
        if ( files.length ) dedupeAndAppend( files )
        e.target.value = ""
    }

    const resolveUserId = createClientOnlyFn( async ( uid: string | null ) => {
        if ( uid ) return uid
        const { data } = await authClient.getSession()
        return data?.user?.id ?? null
    } )

    const handleUpload = async () => {
        if ( !selectedFiles.length ) { setUploadError( "Select at least one file." ); return }
        setUploadError( null )
        const uid = await resolveUserId( userId )
        if ( !uid ) { setUploadError( "Session not ready." ); return }

        const newUploads: UploadingFile[] = selectedFiles.map( ( file ) => ( {
            id: crypto.randomUUID(), file, progress: 0, status: "uploading" as const,
        } ) )
        setUploads( ( prev ) => [...newUploads, ...prev] )
        setSelectedFiles( [] )
        onOpenChange( false )

        const tasks = newUploads.map( ( u ) => ( { id: u.id, file: u.file } ) )
        const count = await uploadBatch( tasks, uid, currentFolderId, 3, setUploads, ( fileInfo ) => {
            // Optimistically add the completed file to the items list
            if ( setItems ) {
                setItems( ( prev ) => [
                    ...prev,
                    {
                        id: fileInfo.id,
                        name: fileInfo.name,
                        objectKey: fileInfo.objectKey,
                        mimeType: fileInfo.mimeType,
                        sizeInBytes: fileInfo.sizeInBytes,
                        userId: uid,
                        folderId: currentFolderId,
                        createdAt: fileInfo.createdAt,
                        updatedAt: fileInfo.createdAt,
                        type: "file" as const,
                    },
                ] )
            }
        } )
        if ( count > 0 ) {
            toast.success( `${count} file${count > 1 ? "s" : ""} uploaded` )
            // Only do a background refresh if we don't have setItems (fallback)
            if ( !setItems ) await onUploadComplete()
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload Files</DialogTitle>
                    <DialogDescription>
                        Drag and drop files or click to browse.
                    </DialogDescription>
                </DialogHeader>

                <div
                    className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border"
                        }`}
                    onClick={() => inputRef.current?.click()}
                    onDragOver={( e ) => {
                        e.preventDefault()
                        setIsDragging( true )
                    }}
                    onDragLeave={() => setIsDragging( false )}
                    onDrop={handleDrop}
                >
                    <Upload className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                    <p className="text-muted-foreground text-sm">
                        Drop files here or click to browse
                    </p>
                    <input
                        ref={inputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleInputChange}
                        aria-label="Select files to upload"
                    />
                </div>

                {selectedFiles.length > 0 && (
                    <div className="max-h-40 overflow-y-auto rounded-md border">
                        <ul className="divide-y">
                            {selectedFiles.map( ( file, i ) => (
                                <li
                                    key={`${file.name}-${file.lastModified}-${i}`}
                                    className="flex items-center justify-between p-2 text-sm"
                                >
                                    <span className="truncate">{file.name}</span>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 shrink-0"
                                        onClick={() =>
                                            setSelectedFiles( ( f ) =>
                                                f.filter( ( _, idx ) => idx !== i )
                                            )
                                        }
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </li>
                            ) )}
                        </ul>
                    </div>
                )}

                <DialogFooter>
                    {uploadError && (
                        <p className="text-destructive mr-auto text-sm">{uploadError}</p>
                    )}
                    <Button onClick={handleUpload} disabled={selectedFiles.length === 0}>
                        Upload
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
