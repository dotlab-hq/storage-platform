import { Button } from '@/components/ui/button'
import { ProviderFormField } from '@/components/admin/provider-form-field'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { formatBytes } from '@/lib/format-bytes'

type ProviderFormState = {
  name: string
  endpoint: string
  region: string
  bucketName: string
  accessKeyId: string
  secretAccessKey: string
  proxyUploadsEnabled: boolean
  isActive: boolean
}

type ProviderTextField = Exclude<
  keyof ProviderFormState,
  'proxyUploadsEnabled' | 'isActive'
>

type ProviderEditorCardProps = {
  form: ProviderFormState
  isEditing: boolean
  isSaving: boolean
  storageLimitInput: string
  fileSizeLimitInput: string
  onChange: (field: ProviderTextField, value: string) => void
  onStorageLimitChange: (value: string) => void
  onFileSizeLimitChange: (value: string) => void
  onProxyUploadsEnabledChange: (value: boolean) => void
  onSubmit: () => void
  onCancel: () => void
}

export function ProviderEditorCard({
  form,
  isEditing,
  isSaving,
  storageLimitInput,
  fileSizeLimitInput,
  onChange,
  onStorageLimitChange,
  onFileSizeLimitChange,
  onProxyUploadsEnabledChange,
  onSubmit,
  onCancel,
}: ProviderEditorCardProps) {
  const parsedStorageLimit = Number(storageLimitInput)
  const parsedFileSizeLimit = Number(fileSizeLimitInput)

  return (
    <div className="rounded-lg bg-card p-4">
      <div className="mb-4">
        <h2 className="text-base font-semibold">
          {isEditing ? 'Update Storage Provider' : 'Add Storage Provider'}
        </h2>
        <p className="text-muted-foreground text-sm">
          Credentials are encrypted at rest.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <ProviderFormField
          label="Name"
          value={form.name}
          onChange={(value) => onChange('name', value)}
        />
        <ProviderFormField
          label="Endpoint"
          value={form.endpoint}
          onChange={(value) => onChange('endpoint', value)}
        />
        <ProviderFormField
          label="Region"
          value={form.region}
          onChange={(value) => onChange('region', value)}
        />
        <ProviderFormField
          label="Bucket Name"
          value={form.bucketName}
          onChange={(value) => onChange('bucketName', value)}
        />
        <ProviderFormField
          label="Access Key ID"
          value={form.accessKeyId}
          onChange={(value) => onChange('accessKeyId', value)}
          placeholder={isEditing ? '••••••••' : ''}
        />
        <ProviderFormField
          label="Secret Access Key"
          value={form.secretAccessKey}
          type="password"
          onChange={(value) => onChange('secretAccessKey', value)}
          placeholder={isEditing ? '••••••••' : ''}
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
        <div className="col-span-full rounded-md px-3">
          <Accordion type="single" collapsible>
            <AccordionItem value="server-s3-advanced" className="border-b-0">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div>
                  <p className="text-sm font-medium">Server S3</p>
                  <p className="text-muted-foreground text-xs">
                    Advanced configuration
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="flex items-start justify-between gap-4 rounded-md p-3">
                  <div className="space-y-1">
                    <Label htmlFor="proxy-uploads-enabled">
                      Proxy uploads through server
                    </Label>
                    <p className="text-muted-foreground text-xs">
                      Stream uploads through our server to the upstream bucket
                      when browser CORS rules block non-GET requests.
                    </p>
                  </div>
                  <Switch
                    id="proxy-uploads-enabled"
                    checked={form.proxyUploadsEnabled}
                    onCheckedChange={onProxyUploadsEnabledChange}
                    aria-label="Proxy uploads through server"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <p className="text-muted-foreground col-span-full text-xs">
          Storage limit:{' '}
          {Number.isFinite(parsedStorageLimit) && parsedStorageLimit > 0
            ? formatBytes(parsedStorageLimit)
            : 'invalid'}{' '}
          | File-size limit:{' '}
          {Number.isFinite(parsedFileSizeLimit) && parsedFileSizeLimit > 0
            ? formatBytes(parsedFileSizeLimit)
            : 'invalid'}
        </p>
        <div className="flex items-end">
          <Button onClick={onSubmit} disabled={isSaving}>
            {isSaving
              ? 'Saving...'
              : isEditing
                ? 'Update Provider'
                : 'Add Provider'}
          </Button>
          {isEditing ? (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="ml-2"
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
