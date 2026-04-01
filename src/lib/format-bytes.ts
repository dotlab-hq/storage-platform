export function formatBytes( bytes: number ) {
    if ( bytes === 0 ) return "0 B"
    const units = ["B", "KB", "MB", "GB", "TB", "PB"]
    const unitIndex = Math.min( Math.floor( Math.log( bytes ) / Math.log( 1024 ) ), units.length - 1 )
    const size = bytes / Math.pow( 1024, unitIndex )
    return `${size.toFixed( unitIndex === 0 ? 0 : 1 )} ${units[unitIndex]}`
}
