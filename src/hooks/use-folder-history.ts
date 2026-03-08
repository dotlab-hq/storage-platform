import { useEffect, useRef } from "react"
import { decodeNavToken, encodeNavToken } from "@/lib/nav-token"

/**
 * Manages browser history for folder navigation.
 * - Pushes a new history entry whenever the user opens a folder or goes back to root.
 * - Handles browser back/forward by restoring the correct folder from the URL.
 * - Restores the initial folder from the URL on first load without adding a history entry.
 */
export function useFolderHistory(
    currentFolderId: string | null,
    setCurrentFolderId: ( id: string | null ) => void
): void {
    const navInitRef = useRef( false )
    const isPopstateRef = useRef( false )

    // Listen for browser back/forward navigation
    useEffect( () => {
        const handlePopstate = () => {
            isPopstateRef.current = true
            const nav = new URLSearchParams( window.location.search ).get( "nav" )
            const p = nav ? decodeNavToken( nav ) : null
            setCurrentFolderId( p?.folderId ?? null )
        }
        window.addEventListener( "popstate", handlePopstate )
        return () => window.removeEventListener( "popstate", handlePopstate )
    }, [setCurrentFolderId] )

    // Sync the URL whenever the current folder changes
    useEffect( () => {
        // First run: restore state from URL without pushing a new history entry
        if ( !navInitRef.current ) {
            navInitRef.current = true
            const nav = new URLSearchParams( window.location.search ).get( "nav" )
            if ( nav ) {
                const p = decodeNavToken( nav )
                if ( p?.folderId ) {
                    // Mark as popstate-like so the follow-up render doesn't push
                    isPopstateRef.current = true
                    setCurrentFolderId( p.folderId )
                    return
                }
            }
            // No nav param on initial load – ensure history state is initialised
            window.history.replaceState( { folderId: null }, "", window.location.pathname )
            return
        }

        // Skip pushing when the change came from popstate or initial URL restore
        if ( isPopstateRef.current ) {
            isPopstateRef.current = false
            return
        }

        // User-initiated folder navigation – push to browser history
        if ( currentFolderId ) {
            window.history.pushState(
                { folderId: currentFolderId },
                "",
                `?nav=${encodeNavToken( { folderId: currentFolderId } )}`
            )
        } else {
            window.history.pushState( { folderId: null }, "", window.location.pathname )
        }
    }, [currentFolderId, setCurrentFolderId] )
}
