import { Folder, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatBytes } from "@/lib/format-bytes"

export type S3ViewerFileEntry = {
    key: string
    name: string
    sizeInBytes: number
    eTag: string | null
    lastModified: string | null
}

export type S3ViewerFolderEntry = {
    name: string
    prefix: string
}

type FolderCardProps = {
    entry: S3ViewerFolderEntry
    onOpen: ( prefix: string ) => void
    onSelect: ( prefix: string ) => void
}

export function S3ViewerFolderCard( { entry, onOpen, onSelect }: FolderCardProps ) {
    return (
        <button
            type="button"
            className="rounded-2xl border bg-background/50 p-3 text-left hover:bg-muted/30"
            onDoubleClick={() => onOpen( entry.prefix )}
            onClick={() => onSelect( entry.prefix )}
        >
            <Folder className="mb-2 h-6 w-6 text-sky-500" />
            <p className="truncate text-sm font-semibold">{entry.name}</p>
        </button>
    )
}

type FileCardProps = {
    entry: S3ViewerFileEntry
    onOpen: ( key: string ) => void
    onDelete: ( key: string ) => void
}

export function S3ViewerFileCard( { entry, onOpen, onDelete }: FileCardProps ) {
    return (
        <div className="rounded-2xl border bg-background/50 p-3">
            <button type="button" className="w-full text-left" onDoubleClick={() => onOpen( entry.key )}>
                <p className="truncate text-sm font-semibold">{entry.name}</p>
                <p className="text-muted-foreground truncate text-xs">{formatBytes( entry.sizeInBytes )}</p>
            </button>
            <div className="mt-2 flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => onOpen( entry.key )}>Open</Button>
                <Button type="button" size="sm" variant="destructive" onClick={() => onDelete( entry.key )}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
