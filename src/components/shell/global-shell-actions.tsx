"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { getActiveConfig } from "@/components/shell/shell-actions-registry"

const MENU_WIDTH_PX = 240
const MENU_HEIGHT_PX = 260
const VIEWPORT_MARGIN_PX = 8

function isMacOS(): boolean {
    return typeof navigator !== "undefined" && navigator.platform.toLowerCase().includes( "mac" )
}

function isFileCardTarget( target: EventTarget | null ): boolean {
    if ( !( target instanceof Element ) ) return false
    return Boolean( target.closest( "[data-file-card='true']" ) )
}

function isShellMenuTarget( target: EventTarget | null ): boolean {
    if ( !( target instanceof Element ) ) return false
    return Boolean( target.closest( "[data-shell-context-menu='true']" ) )
}

function clampToViewport( x: number, y: number ) {
    const maxX = Math.max( VIEWPORT_MARGIN_PX, window.innerWidth - MENU_WIDTH_PX - VIEWPORT_MARGIN_PX )
    const maxY = Math.max( VIEWPORT_MARGIN_PX, window.innerHeight - MENU_HEIGHT_PX - VIEWPORT_MARGIN_PX )
    return {
        x: Math.min( Math.max( x, VIEWPORT_MARGIN_PX ), maxX ),
        y: Math.min( Math.max( y, VIEWPORT_MARGIN_PX ), maxY ),
    }
}

export function GlobalShellActions( { children }: { children: React.ReactNode } ) {
    const [commandOpen, setCommandOpen] = useState( false )
    const [contextOpen, setContextOpen] = useState( false )
    const [version, setVersion] = useState( 0 )

    useEffect( () => {
        const sync = () => setVersion( ( prev ) => prev + 1 )
        window.addEventListener( "dot:shell-actions-changed", sync )
        return () => window.removeEventListener( "dot:shell-actions-changed", sync )
    }, [] )

    const activeConfig = useMemo( () => getActiveConfig(), [version] )

    const closeContextMenu = useCallback( () => {
        setContextOpen( false )
    }, [] )

    useEffect( () => {
        const onKeyDown = ( event: KeyboardEvent ) => {
            if ( event.key.toLowerCase() !== "k" || ( !event.ctrlKey && !event.metaKey ) ) return
            event.preventDefault()
            if ( getActiveConfig().commandActions.length === 0 ) return
            setCommandOpen( true )
        }

        const onContextMenu = ( event: MouseEvent ) => {
            if ( isFileCardTarget( event.target ) ) return
            event.preventDefault()
            const { x, y } = clampToViewport( event.clientX + 2, event.clientY + 2 )
            document.documentElement.style.setProperty( "--dot-shell-menu-x", `${x}px` )
            document.documentElement.style.setProperty( "--dot-shell-menu-y", `${y}px` )
            setContextOpen( true )
        }

        const onPointerDown = ( event: PointerEvent ) => {
            if ( isShellMenuTarget( event.target ) ) return
            closeContextMenu()
        }
        const onEscape = ( event: KeyboardEvent ) => {
            if ( event.key === "Escape" ) closeContextMenu()
        }

        document.addEventListener( "keydown", onKeyDown )
        document.addEventListener( "contextmenu", onContextMenu )
        document.addEventListener( "pointerdown", onPointerDown )
        document.addEventListener( "keydown", onEscape )

        return () => {
            document.removeEventListener( "keydown", onKeyDown )
            document.removeEventListener( "contextmenu", onContextMenu )
            document.removeEventListener( "pointerdown", onPointerDown )
            document.removeEventListener( "keydown", onEscape )
        }
    }, [closeContextMenu] )

    const commandHint = isMacOS() ? "Cmd+K" : "Ctrl+K"

    return (
        <>
            {children}

            {contextOpen && (
                <div
                    data-shell-context-menu="true"
                    className={cn(
                        "bg-popover text-popover-foreground fixed left-(--dot-shell-menu-x) top-(--dot-shell-menu-y) z-50 min-w-52 rounded-md border p-1 shadow-md"
                    )}
                >
                    {activeConfig.contextActions.length > 0 ? activeConfig.contextActions.map( ( action ) => (
                        <button
                            key={action.id}
                            type="button"
                            className={cn(
                                "focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground flex w-full rounded-sm px-2 py-1.5 text-left text-sm outline-none focus-visible:ring-1",
                                action.destructive && "text-destructive"
                            )}
                            onClick={() => {
                                closeContextMenu()
                                action.onSelect()
                            }}
                        >
                            {action.label}
                        </button>
                    ) ) : (
                        <div className="text-muted-foreground px-2 py-1.5 text-sm">No actions here</div>
                    )}
                </div>
            )}

            <Dialog open={commandOpen} onOpenChange={setCommandOpen}>
                <DialogContent className="overflow-hidden p-0 shadow-lg">
                    <Command>
                        <CommandInput placeholder={`Type a command (${commandHint})`} />
                        <CommandList>
                            <CommandEmpty>No commands in this view.</CommandEmpty>
                            <CommandGroup heading="Commands">
                                {activeConfig.commandActions.map( ( action ) => (
                                    <CommandItem
                                        key={action.id}
                                        onSelect={() => {
                                            setCommandOpen( false )
                                            action.onSelect()
                                        }}
                                    >
                                        <span>{action.label}</span>
                                    </CommandItem>
                                ) )}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </DialogContent>
            </Dialog>
        </>
    )
}
