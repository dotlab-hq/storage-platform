import { useCallback, useRef, useState } from "react"
import { toast } from "@/components/ui/sonner"
import { uploadBatch } from "@/lib/upload-utils"
import type { UploadingFile } from "@/types/storage"

export function useDragDrop(
    userId: string | null,
    currentFolderId: string | null,
    setUploads: React.Dispatch<React.SetStateAction<UploadingFile[]>>,
    onComplete: () => Promise<void>
) {
    const [isDragging, setIsDragging] = useState( false )
    const dragCounter = useRef( 0 )

    const handleDragEnter = useCallback( ( e: React.DragEvent ) => {
        e.preventDefault()
        dragCounter.current++
        if ( e.dataTransfer.types.includes( "Files" ) ) setIsDragging( true )
    }, [] )

    const handleDragLeave = useCallback( ( e: React.DragEvent ) => {
        e.preventDefault()
        dragCounter.current--
        if ( dragCounter.current === 0 ) setIsDragging( false )
    }, [] )

    const handleDragOver = useCallback( ( e: React.DragEvent ) => {
        e.preventDefault()
    }, [] )

    const handleDrop = useCallback(
        async ( e: React.DragEvent ) => {
            e.preventDefault()
            setIsDragging( false )
            dragCounter.current = 0

            if ( !userId ) { toast.error( "Not authenticated" ); return }

            const files = Array.from( e.dataTransfer.files )
            if ( files.length === 0 ) return

            const newUploads: UploadingFile[] = files.map( ( file ) => ( {
                id: crypto.randomUUID(),
                file,
                progress: 0,
                status: "uploading" as const,
            } ) )

            setUploads( ( prev ) => [...newUploads, ...prev] )

            const tasks = newUploads.map( ( u ) => ( { id: u.id, file: u.file } ) )
            const successCount = await uploadBatch(
                tasks, userId, currentFolderId, 3, setUploads
            )

            if ( successCount > 0 ) {
                toast.success(
                    `${successCount} file${successCount > 1 ? "s" : ""} uploaded`
                )
                await onComplete()
            }
        },
        [userId, currentFolderId, setUploads, onComplete]
    )

    return {
        isDragging,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDrop,
    }
}
