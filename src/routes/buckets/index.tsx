import { createFileRoute } from "@tanstack/react-router"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useQuota } from "@/hooks/use-quota"

export const Route = createFileRoute( "/buckets/" as never )( {
    component: BucketsPage,
} )

function BucketsPage() {
    const quota = useQuota()

    return (
        <div className="min-h-screen">
            <SidebarProvider>
                <AppSidebar quota={quota} />
                <SidebarInset>
                    <header className="flex h-14 shrink-0 items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                        <h1 className="text-sm font-semibold">Buckets</h1>
                    </header>
                    <div className="p-4">
                        <div className="rounded-lg border p-4">
                            <h2 className="text-sm font-medium">S3 Buckets</h2>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Bucket management UI is now scaffolded. Next step adds create, delete, and empty actions backed by /api/storage/s3 endpoints.
                            </p>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}
