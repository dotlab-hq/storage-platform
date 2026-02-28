import { useCallback, useState } from "react"

export function useTheme() {
    const [theme, setThemeState] = useState<"light" | "dark">( () => {
        if ( typeof window === "undefined" ) return "light"
        const stored = localStorage.getItem( "theme" )
        if ( stored === "dark" || stored === "light" ) return stored
        return window.matchMedia( "(prefers-color-scheme: dark)" ).matches
            ? "dark"
            : "light"
    } )

    const setTheme = useCallback( ( newTheme: "light" | "dark" ) => {
        setThemeState( newTheme )
        localStorage.setItem( "theme", newTheme )
        document.documentElement.classList.toggle( "dark", newTheme === "dark" )
    }, [] )

    const toggleTheme = useCallback( () => {
        setTheme( theme === "dark" ? "light" : "dark" )
    }, [theme, setTheme] )

    return { theme, setTheme, toggleTheme }
}
