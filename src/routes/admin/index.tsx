import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/sonner"
import { createStorageProviderFn, deleteStorageProviderFn, getAdminDashboardDataFn, setStorageProviderAvailabilityFn } from "./-admin-server"
import { MetricCard, ProvidersPanel, UsersPanel } from "@/components/admin/dashboard-panels"
import { formatBytes } from "@/lib/format-bytes"
import { ProviderFormField } from "@/components/admin/provider-form-field"

const emptyProviderForm = {
    name: "",
    endpoint: "",
    region: "",
    bucketName: "",
    accessKeyId: "",
    secretAccessKey: "",
    storageLimitBytes: 10 * 1024 * 1024 * 1024,
}

export const Route = createFileRoute( "/admin/" )( {
    component: AdminDashboardPage,
    loader: () => getAdminDashboardDataFn(),
} )

function AdminDashboardPage() {
    const initial = Route.useLoaderData()
    const [data, setData] = useState( initial )
    const [isSaving, setIsSaving] = useState( false )
    const [form, setForm] = useState( emptyProviderForm )
    const [storageLimitInput, setStorageLimitInput] = useState( String( emptyProviderForm.storageLimitBytes ) )

    const submitProvider = async () => {
        const parsedLimit = Number( storageLimitInput )
        if ( !Number.isFinite( parsedLimit ) || parsedLimit <= 0 ) {
            toast.error( "Storage limit must be a positive number" )
            return
        }
        if ( !form.name.trim() ) {
            toast.error( "Provider name is required" )
            return
        }
        const optimisticProviderCount = data.summary.providerCount + 1
        setIsSaving( true )
        setData( ( prev ) => ( {
            ...prev,
            summary: {
                ...prev.summary,
                providerCount: optimisticProviderCount,
            },
            providers: [
                ...prev.providers,
                {
                    id: `optimistic-${Date.now()}`,
                    name: form.name || "New Provider",
                    region: form.region || "pending",
                    endpoint: form.endpoint || "pending",
                    bucketName: form.bucketName || "pending",
                    storageLimitBytes: parsedLimit,
                    isActive: true,
                    createdAt: new Date(),
                    usedStorageBytes: 0,
                },
            ],
        } ) )
        try {
            const result = await createStorageProviderFn( { data: { ...form, storageLimitBytes: parsedLimit, isActive: true } } )
            const refreshed = await getAdminDashboardDataFn()
            setData( refreshed )
            setForm( emptyProviderForm )
            setStorageLimitInput( String( emptyProviderForm.storageLimitBytes ) )
            toast.success( result.operation === "updated" ? "Storage provider updated" : "Storage provider added" )
        } catch ( error ) {
            const latest = await getAdminDashboardDataFn()
            setData( latest )
            const message = error instanceof Error ? error.message : "Failed to create provider"
            toast.error( message )
        } finally {
            setIsSaving( false )
        }
    }

    const toggleProviderAvailability = async ( providerId: string, isActive: boolean ) => {
        setData( ( prev ) => ( {
            ...prev,
            providers: prev.providers.map( ( provider ) => (
                provider.id === providerId ? { ...provider, isActive } : provider
            ) ),
        } ) )
        try {
            await setStorageProviderAvailabilityFn( { data: { providerId, isActive } } )
            toast.success( `Provider marked as ${isActive ? "available" : "unavailable"}` )
        } catch ( error ) {
            const refreshed = await getAdminDashboardDataFn()
            setData( refreshed )
            const message = error instanceof Error ? error.message : "Failed to update provider availability"
            toast.error( message )
        }
    }

    const deleteProvider = async ( providerId: string ) => {
        try {
            await deleteStorageProviderFn( { data: { providerId } } )
            const refreshed = await getAdminDashboardDataFn()
            setData( refreshed )
            toast.success( "Storage provider deleted" )
        } catch ( error ) {
            const message = error instanceof Error ? error.message : "Failed to delete provider"
            toast.error( message )
        }
    }

    return (
        <div className="min-h-screen">
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-14 shrink-0 items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                        <h1 className="text-sm font-semibold">Admin Dashboard</h1>
                    </header>
                    <div className="grid gap-4 p-4 md:grid-cols-3">
                        <MetricCard title="Providers" value={data.summary.providerCount} />
                        <MetricCard title="Users" value={data.summary.userCount} />
                        <MetricCard title="Total Used" value={formatBytes( data.summary.totalUsedStorageBytes )} />
                    </div>
                    <div className="grid gap-4 p-4 lg:grid-cols-2">
                        <ProvidersPanel
                            providers={data.providers}
                            onToggleAvailability={toggleProviderAvailability}
                            onDelete={deleteProvider}
                        />
                        <UsersPanel users={data.users} />
                    </div>
                    <div className="p-4">
                        <div className="rounded-lg border bg-card p-4">
                            <div className="mb-4">
                                <h2 className="text-base font-semibold">Add Storage Provider</h2>
                                <p className="text-muted-foreground text-sm">Credentials are encrypted at rest.</p>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <ProviderFormField label="Name" value={form.name} onChange={( value ) => setForm( ( prev ) => ( { ...prev, name: value } ) )} />
                                <ProviderFormField label="Endpoint" value={form.endpoint} onChange={( value ) => setForm( ( prev ) => ( { ...prev, endpoint: value } ) )} />
                                <ProviderFormField label="Region" value={form.region} onChange={( value ) => setForm( ( prev ) => ( { ...prev, region: value } ) )} />
                                <ProviderFormField label="Bucket Name" value={form.bucketName} onChange={( value ) => setForm( ( prev ) => ( { ...prev, bucketName: value } ) )} />
                                <ProviderFormField label="Access Key ID" value={form.accessKeyId} onChange={( value ) => setForm( ( prev ) => ( { ...prev, accessKeyId: value } ) )} />
                                <ProviderFormField
                                    label="Secret Access Key"
                                    value={form.secretAccessKey}
                                    type="password"
                                    onChange={( value ) => setForm( ( prev ) => ( { ...prev, secretAccessKey: value } ) )}
                                />
                                <ProviderFormField
                                    label="Storage Limit (bytes)"
                                    value={storageLimitInput}
                                    onChange={setStorageLimitInput}
                                />
                                <div className="flex items-end">
                                    <Button onClick={() => void submitProvider()} disabled={isSaving}>
                                        {isSaving ? "Saving..." : "Add / Update Provider"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}
