import { AppSidebar } from "@/components/app-sidebar"
import { SkeletonGrid } from "@/components/storage/skeleton-card"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export function HomeRoutePending() {
    return (
        <div className="min-h-screen">
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-14 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-1" />
                            <Separator
                                orientation="vertical"
                                className="mr-2 data-[orientation=vertical]:h-4"
                            />
                            <div className="bg-muted h-4 w-36 animate-pulse rounded" />
                        </div>
                        <div className="bg-muted h-8 w-28 animate-pulse rounded" />
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                        <SkeletonGrid count={12} />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}