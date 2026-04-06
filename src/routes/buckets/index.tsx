import { createFileRoute } from "@tanstack/react-router"
import { RootLayout } from "@/lib/providers.tsx/RootProvider"
import { BucketManager } from "@/components/storage/bucket-manager"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { useQuota } from "@/hooks/use-quota"

export const Route = createFileRoute( "/buckets/" as never )( {
    component: BucketsPage,
} )

function BucketsPage() {
    const quota = useQuota()

    return (
        <RootLayout quota={quota}>
            <SidebarInset>
                <header className="flex h-14 shrink-0 items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                    <h1 className="text-sm font-semibold">Buckets</h1>
                </header>
                <div className="p-4">
                    <BucketManager />
                </div>
            </SidebarInset>
        </RootLayout>
