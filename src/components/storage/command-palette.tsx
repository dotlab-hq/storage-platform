"use client"

import { useCallback, useEffect, useState } from "react"
import {
    FolderPlus,
    Trash2,
    Upload,
    Sun,
    Clock,
    Share2,
    Home,
    FolderOpen,
} from "lucide-react"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"

type CommandPaletteAction = {
    id: string
    label: string
    icon: React.ReactNode
    shortcut?: string
    onSelect: () => void
    group: string
}

type CommandPaletteProps = {
    actions?: CommandPaletteAction[]
    onNavigate?: ( route: string ) => void
    onToggleTheme?: () => void
    onUpload?: () => void
    onNewFolder?: () => void
    onOpenSharedFolder?: () => void
}

export function CommandPalette( {
    actions = [],
    onNavigate,
    onToggleTheme,
    onUpload,
    onNewFolder,
    onOpenSharedFolder,
}: CommandPaletteProps ) {
    const [open, setOpen] = useState( false )

    useEffect( () => {
        const handler = ( e: KeyboardEvent ) => {
            if ( e.key === "k" && ( e.metaKey || e.ctrlKey ) ) {
                e.preventDefault()
                setOpen( ( prev ) => !prev )
            }
        }
        window.addEventListener( "keydown", handler )
        return () => window.removeEventListener( "keydown", handler )
    }, [] )

    const handleSelect = useCallback(
        ( fn: ( () => void ) | undefined ) => {
            setOpen( false )
            fn?.()
        },
        []
    )

    const builtInActions: CommandPaletteAction[] = [
        {
            id: "home",
            label: "Go to My Files",
            icon: <Home className="h-4 w-4" />,
            shortcut: "G H",
            onSelect: () => onNavigate?.( "/" ),
            group: "Navigation",
        },
        {
            id: "recent",
            label: "Go to Recent",
            icon: <Clock className="h-4 w-4" />,
            onSelect: () => onNavigate?.( "/recent" ),
            group: "Navigation",
        },
        {
            id: "shared",
            label: "Go to Shared with Me",
            icon: <Share2 className="h-4 w-4" />,
            onSelect: () => onNavigate?.( "/shared" ),
            group: "Navigation",
        },
        {
            id: "open-shared-folder-link",
            label: "Open Shared Folder Link",
            icon: <FolderOpen className="h-4 w-4" />,
            onSelect: () => onOpenSharedFolder?.(),
            group: "Navigation",
        },
        {
            id: "trash",
            label: "Go to Trash",
            icon: <Trash2 className="h-4 w-4" />,
            onSelect: () => onNavigate?.( "/trash" ),
            group: "Navigation",
        },
        {
            id: "upload",
            label: "Upload Files",
            icon: <Upload className="h-4 w-4" />,
            shortcut: "U",
            onSelect: () => onUpload?.(),
            group: "Actions",
        },
        {
            id: "new-folder",
            label: "Create New Folder",
            icon: <FolderPlus className="h-4 w-4" />,
            shortcut: "N",
            onSelect: () => onNewFolder?.(),
            group: "Actions",
        },
        {
            id: "toggle-theme",
            label: "Toggle Theme",
            icon: <Sun className="h-4 w-4 dark:hidden" />,
            onSelect: () => onToggleTheme?.(),
            group: "Preferences",
        },
    ]

    const allActions = [...builtInActions, ...actions]
    const grouped = allActions.reduce<Partial<Record<string, CommandPaletteAction[]>>>(
        ( acc, action ) => {
            const group = action.group
            if ( !acc[group] ) acc[group] = []
            acc[group].push( action )
            return acc
        },
        {}
    )

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="overflow-hidden p-0 shadow-lg">
                <Command>
                    <CommandInput placeholder="Type a command or search..." />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        {Object.entries( grouped ).map( ( [group, groupActions], i ) => (
                            <div key={group}>
                                {i > 0 && <CommandSeparator />}
                                <CommandGroup heading={group}>
                                    {groupActions.map( ( action ) => (
                                        <CommandItem
                                            key={action.id}
                                            onSelect={() => handleSelect( action.onSelect )}
                                        >
                                            {action.icon}
                                            <span>{action.label}</span>
                                            {action.shortcut && (
                                                <CommandShortcut>{action.shortcut}</CommandShortcut>
                                            )}
                                        </CommandItem>
                                    ) )}
                                </CommandGroup>
                            </div>
                        ) )}
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    )
}
