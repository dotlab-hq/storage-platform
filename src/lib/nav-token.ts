export type NavPayload = {
    folderId?: string | null
    fileId?: string
}

/** Base64url‑encode a navigation payload so it can sit in a query param. */
export function encodeNavToken( payload: NavPayload ): string {
    const json = JSON.stringify( payload )
    return btoa( json )
        .replace( /\+/g, "-" )
        .replace( /\//g, "_" )
        .replace( /=+$/, "" )
}

/** Decode a base64url navigation token back to its payload. */
export function decodeNavToken( token: string ): NavPayload | null {
    try {
        let base64 = token.replace( /-/g, "+" ).replace( /_/g, "/" )
        const pad = base64.length % 4
        if ( pad ) base64 += "=".repeat( 4 - pad )
        return JSON.parse( atob( base64 ) ) as NavPayload
    } catch {
        return null
    }
}

/** Build a full shareable URL that encodes the given navigation payload. */
export function buildNavUrl( payload: NavPayload ): string {
    const token = encodeNavToken( payload )
    return `${window.location.origin}?nav=${token}`
}
