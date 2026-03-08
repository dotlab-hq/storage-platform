import {
    File,
    FileText,
    FileImage,
    FileVideo,
    FileAudio,
    FileCode,
    FileArchive,
    FileSpreadsheet,
    Folder,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const MIME_ICON_MAP: Record<string, LucideIcon> = {
    "image/": FileImage,
    "video/": FileVideo,
    "audio/": FileAudio,
    "text/": FileText,
    "application/pdf": FileText,
    "application/json": FileCode,
    "application/javascript": FileCode,
    "application/typescript": FileCode,
    "application/xml": FileCode,
    "application/zip": FileArchive,
    "application/gzip": FileArchive,
    "application/x-rar": FileArchive,
    "application/x-tar": FileArchive,
    "application/vnd.ms-excel": FileSpreadsheet,
    "application/vnd.openxmlformats-officedocument.spreadsheetml": FileSpreadsheet,
    "text/csv": FileSpreadsheet,
}

export function getFileIcon( mimeType: string | null ): LucideIcon {
    if ( !mimeType ) return File

    for ( const [prefix, icon] of Object.entries( MIME_ICON_MAP ) ) {
        if ( mimeType.startsWith( prefix ) ) return icon
    }
    return File
}

export function getFolderIcon(): LucideIcon {
    return Folder
}

export function formatFileSize( bytes: number ): string {
    if ( bytes === 0 ) return "0 B"
    const units = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor( Math.log( bytes ) / Math.log( 1024 ) )
    const size = bytes / Math.pow( 1024, i )
    return `${size.toFixed( i === 0 ? 0 : 1 )} ${units[i]}`
}

export async function downloadFromUrl( url: string, filename: string ): Promise<void> {
    const response = await fetch( url )
    if ( !response.ok ) throw new Error( `Failed to download: HTTP ${response.status} ${response.statusText}` )
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL( blob )
    const a = document.createElement( "a" )
    a.href = blobUrl
    a.download = filename
    document.body.appendChild( a )
    a.click()
    document.body.removeChild( a )
    URL.revokeObjectURL( blobUrl )
}

export function formatRelativeTime( date: Date ): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor( diffMs / 1000 )
    const diffMin = Math.floor( diffSec / 60 )
    const diffHour = Math.floor( diffMin / 60 )
    const diffDay = Math.floor( diffHour / 24 )

    if ( diffSec < 60 ) return "Just now"
    if ( diffMin < 60 ) return `${diffMin}m ago`
    if ( diffHour < 24 ) return `${diffHour}h ago`
    if ( diffDay < 7 ) return `${diffDay}d ago`
    return date.toLocaleDateString()
}
