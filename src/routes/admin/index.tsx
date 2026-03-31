import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/sonner"
import { createStorageProviderFn, getAdminDashboardDataFn } from "./-admin-server"
import { MetricCard, ProvidersPanel, UsersPanel } from "@/components/admin/dashboard-panels"
import { formatBytes } from "@/lib/format-bytes"

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
        if (
            !form.name.trim() ||
            !form.endpoint.trim() ||
            !form.region.trim() ||
            !form.bucketName.trim() ||
            !form.accessKeyId.trim() ||
            !form.secretAccessKey.trim()
        ) {
            toast.error( "Please fill in all provider fields" )
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
            await createStorageProviderFn( { data: { ...form, storageLimitBytes: parsedLimit, isActive: true } } )
            const refreshed = await getAdminDashboardDataFn()
            setData( refreshed )
            setForm( emptyProviderForm )
            setStorageLimitInput( String( emptyProviderForm.storageLimitBytes ) )
            toast.success( "Storage provider added" )
        } catch ( error ) {
            const latest = await getAdminDashboardDataFn()
            setData( latest )
            const message = error instanceof Error ? error.message : "Failed to create provider"
            toast.error( message )
        } finally {
            setIsSaving( false )
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
                        <ProvidersPanel providers={data.providers} />
                        <UsersPanel users={data.users} />
                    </div>
                    <div className="p-4">
                        <div className="rounded-lg border bg-card p-4">
                            <div className="mb-4">
                                <h2 className="text-base font-semibold">Add Storage Provider</h2>
                                <p className="text-muted-foreground text-sm">Credentials are encrypted at rest.</p>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <Field label="Name" value={form.name} onChange={( value ) => setForm( ( prev ) => ( { ...prev, name: value } ) )} />
                                <Field label="Endpoint" value={form.endpoint} onChange={( value ) => setForm( ( prev ) => ( { ...prev, endpoint: value } ) )} />
                                <Field label="Region" value={form.region} onChange={( value ) => setForm( ( prev ) => ( { ...prev, region: value } ) )} />
                                <Field label="Bucket Name" value={form.bucketName} onChange={( value ) => setForm( ( prev ) => ( { ...prev, bucketName: value } ) )} />
                                <Field label="Access Key ID" value={form.accessKeyId} onChange={( value ) => setForm( ( prev ) => ( { ...prev, accessKeyId: value } ) )} />
                                <Field
                                    label="Secret Access Key"
                                    value={form.secretAccessKey}
                                    type="password"
                                    onChange={( value ) => setForm( ( prev ) => ( { ...prev, secretAccessKey: value } ) )}
                                />
                                <Field
                                    label="Storage Limit (bytes)"
                                    value={storageLimitInput}
                                    onChange={setStorageLimitInput}
                                />
                                <div className="flex items-end">
                                    <Button onClick={() => void submitProvider()} disabled={isSaving}>
                                        {isSaving ? "Saving..." : "Add Provider"}
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

function Field( {
    label,
    value,
    onChange,
    type = "text",
}: {
    label: string
    value: string
    onChange: (value: string) => void
    type?: "text" | "password"
} ) {
    return (
        <div className="space-y-1">
            <Label>{label}</Label>
            <Input type={type} value={value} onChange={( event ) => onChange( event.target.value )} />
        </div>
    )
}
