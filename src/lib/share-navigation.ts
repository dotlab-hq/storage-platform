export function parseShareToken( value: string ): string | null {
    const trimmed = value.trim()
    if ( !trimmed ) return null

    if ( trimmed.startsWith( "http://" ) || trimmed.startsWith( "https://" ) ) {
        try {
            const parsed = new URL( trimmed )
            const segments = parsed.pathname.split( "/" ).filter( Boolean )
            return segments[segments.length - 1] ?? null
        } catch {
            return null
        }
    }

    return trimmed
}
