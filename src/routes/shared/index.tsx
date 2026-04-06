import { createFileRoute } from "@tanstack/react-router"
import { RootLayout } from "@/lib/providers.tsx/RootProvider"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Share2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useQuota } from "@/hooks/use-quota"

export const Route = createFileRoute( "/shared/" )( { component: SharedPage } )

function SharedPage() {
    const quota = useQuota()
    // Placeholder — shared items will come from a server function
    const sharedItems: {
        id: string
        name: string
        sharedBy: string
        sharedByAvatar: string
        permission: "view" | "edit"
    }[] = []

    return (
        <RootLayout quota={quota}>
            <SidebarInset>
                <header className="flex h-14 shrink-0 items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                    />
                    <div className="flex items-center gap-2">
                        <Share2 className="text-muted-foreground h-4 w-4" />
                        <h1 className="text-sm font-semibold">Shared with Me</h1>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {sharedItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="bg-muted mb-4 rounded-full p-4">
                                <Share2 className="text-muted-foreground h-8 w-8" />
                            </div>
                            <h3 className="text-foreground mb-1 text-sm font-medium">
                                Nothing shared yet
                            </h3>
                            <p className="text-muted-foreground text-sm">
                                Files shared with you will appear here
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {sharedItems.map( ( item ) => (
                                <div
                                    key={item.id}
                                    className="bg-card hover:bg-accent/50 rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    <p className="mb-2 truncate text-sm font-medium">
                                        {item.name}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="bg-muted flex h-5 w-5 items-center justify-center rounded-full text-[10px]">
                                            {item.sharedBy.charAt( 0 ).toUpperCase()}
                                        </div>
                                        <span className="text-muted-foreground truncate text-xs">
                                            {item.sharedBy}
                                        </span>
                                    </div>
                                    <Badge
                                        variant={
                                            item.permission === "edit" ? "default" : "secondary"
                                        }
                                        className="mt-2 text-[10px]"
                                    >
                                        {item.permission === "edit" ? "Can edit" : "View only"}
                                    </Badge>
                                </div>
                            ) )}
                        </div>
                    )}
                </div>
            </SidebarInset>
        </RootLayout>)
}