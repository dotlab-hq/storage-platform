import { Button } from "@/components/ui/button"
import { ProviderFormField } from "@/components/admin/provider-form-field"
import { formatBytes } from "@/lib/format-bytes"

type ProviderFormState = {
    name: string
    endpoint: string
    region: string
    bucketName: string
    accessKeyId: string
    secretAccessKey: string
}

type ProviderEditorCardProps = {
    form: ProviderFormState
    isEditing: boolean
    isSaving: boolean
    storageLimitInput: string
    fileSizeLimitInput: string
    onChange: ( field: keyof ProviderFormState, value: string ) => void
    onStorageLimitChange: ( value: string ) => void
    onFileSizeLimitChange: ( value: string ) => void
    onSubmit: () => void
    onCancel: () => void
}

export function ProviderEditorCard( {
    form,
    isEditing,
    isSaving,
    storageLimitInput,
    fileSizeLimitInput,
    onChange,
    onStorageLimitChange,
    onFileSizeLimitChange,
    onSubmit,
    onCancel,
}: ProviderEditorCardProps ) {
    const parsedStorageLimit = Number( storageLimitInput )
    const parsedFileSizeLimit = Number( fileSizeLimitInput )

    return (
        <div className="rounded-lg border bg-card p-4">
            <div className="mb-4">
                <h2 className="text-base font-semibold">{isEditing ? "Update Storage Provider" : "Add Storage Provider"}</h2>
                <p className="text-muted-foreground text-sm">Credentials are encrypted at rest.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
                <ProviderFormField label="Name" value={form.name} onChange={( value ) => onChange( "name", value )} />
                <ProviderFormField label="Endpoint" value={form.endpoint} onChange={( value ) => onChange( "endpoint", value )} />
                <ProviderFormField label="Region" value={form.region} onChange={( value ) => onChange( "region", value )} />
                <ProviderFormField label="Bucket Name" value={form.bucketName} onChange={( value ) => onChange( "bucketName", value )} />
                <ProviderFormField label="Access Key ID" value={form.accessKeyId} onChange={( value ) => onChange( "accessKeyId", value )} />
                <ProviderFormField
                    label="Secret Access Key"
                    value={form.secretAccessKey}
                    type="password"
                    onChange={( value ) => onChange( "secretAccessKey", value )}
                />
                <ProviderFormField
                    label="Storage Limit (bytes)"
                    value={storageLimitInput}
                    onChange={onStorageLimitChange}
                />
                <ProviderFormField
                    label="File-Size Limit (bytes)"
                    value={fileSizeLimitInput}
                    onChange={onFileSizeLimitChange}
                />
                <p className="text-muted-foreground col-span-full text-xs">
                    Storage limit: {Number.isFinite( parsedStorageLimit ) && parsedStorageLimit > 0 ? formatBytes( parsedStorageLimit ) : "invalid"} | File-size limit: {Number.isFinite( parsedFileSizeLimit ) && parsedFileSizeLimit > 0 ? formatBytes( parsedFileSizeLimit ) : "invalid"}
                </p>
                <div className="flex items-end">
                    <Button onClick={onSubmit} disabled={isSaving}>
                        {isSaving ? "Saving..." : isEditing ? "Update Provider" : "Add Provider"}
                    </Button>
                    {isEditing ? (
                        <Button type="button" variant="ghost" onClick={onCancel} className="ml-2">
                            Cancel
                        </Button>
                    ) : null}
                </div>
            </div>
        </div>
    )
}
