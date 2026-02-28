import { useCallback, useEffect } from "react"

type ShortcutMap = Record<string, () => void>

export function useKeyboardShortcuts( shortcuts: ShortcutMap ) {
    const handler = useCallback(
        ( e: KeyboardEvent ) => {
            const target = e.target as HTMLElement
            const isInput =
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable

            if ( isInput ) return

            const mod = e.metaKey || e.ctrlKey
            const shift = e.shiftKey

            let key = ""
            if ( mod ) key += "mod+"
            if ( shift ) key += "shift+"
            key += e.key.toLowerCase()

            const action = shortcuts[key]
            if ( action ) {
                e.preventDefault()
                action()
            }
        },
        [shortcuts]
    )

    useEffect( () => {
        window.addEventListener( "keydown", handler )
        return () => window.removeEventListener( "keydown", handler )
    }, [handler] )
}
