import { useEffect, useState } from "react"
import { ChevronRight, Home, MoreHorizontal } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { BreadcrumbItem } from "@/types/storage"

function useBreakpointLimit() {
    const [limit, setLimit] = useState( 4 )
    useEffect( () => {
        const update = () => {
            const w = window.innerWidth
            if ( w >= 1024 ) setLimit( 4 )
            else if ( w >= 768 ) setLimit( 3 )
            else setLimit( 2 )
        }
        update()
        window.addEventListener( "resize", update )
        return () => window.removeEventListener( "resize", update )
    }, [] )
    return limit
}

type BreadcrumbNavProps = {
    items: BreadcrumbItem[]
    onNavigate: ( folderId: string | null ) => void
}

const crumbBtn =
    "text-muted-foreground hover:text-foreground max-w-40 truncate rounded-md px-2 py-1 transition-colors hover:bg-accent"

export function BreadcrumbNav( { items, onNavigate }: BreadcrumbNavProps ) {
    const limit = useBreakpointLimit()
    const showEllipsis = items.length > limit
    const visibleItems = showEllipsis ? items.slice( -limit ) : items
    const hiddenItems = showEllipsis ? items.slice( 0, items.length - limit ) : []

    return (
        <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb">
            <button
                onClick={() => onNavigate( null )}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-accent"
            >
                <Home className="h-3.5 w-3.5" />
                <span>My Files</span>
            </button>

            {showEllipsis && (
                <>
                    <ChevronRight className="text-muted-foreground h-3.5 w-3.5" />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className={crumbBtn} title="Show parent folders">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            {hiddenItems.map( ( item ) => (
                                <DropdownMenuItem
                                    key={item.id ?? "root"}
                                    onClick={() => onNavigate( item.id )}
                                >
                                    {item.name}
                                </DropdownMenuItem>
                            ) )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            )}

            {visibleItems.map( ( item ) => (
                <div key={item.id ?? "root"} className="flex items-center gap-1">
                    <ChevronRight className="text-muted-foreground h-3.5 w-3.5" />
                    <button
                        onClick={() => onNavigate( item.id )}
                        className={crumbBtn}
                    >
                        {item.name}
                    </button>
                </div>
            ) )}
        </nav>
    )
}
