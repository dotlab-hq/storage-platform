import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/components/ui/sonner'
import { ProviderEditorCard } from '@/components/admin/provider-editor-card'
import type { UserProvider } from '@/lib/storage-provider-queries'
import type { SaveProviderInput } from './use-user-provider-mutations'

const DEFAULT_STORAGE_LIMIT = 10 * 1024 * 1024 * 1024
const DEFAULT_FILE_SIZE_LIMIT = 100 * 1024 * 1024

type ProviderFormDialogProps = {
  /** The provider being edited, or null to add a new one. */
  provider: UserProvider | null
  isSaving: boolean
  onSave: (input: SaveProviderInput) => void
  onClose: () => void
}

function initialForm(provider: UserProvider | null) {
  return {
    name: provider?.name ?? '',
    endpoint: provider?.endpoint ?? '',
    region: provider?.region ?? '',
    bucketName: provider?.bucketName ?? '',
    // Secrets are never sent to the client; blank keeps the stored value.
    accessKeyId: '',
    secretAccessKey: '',
    proxyUploadsEnabled: provider?.proxyUploadsEnabled ?? false,
    isActive: provider?.isActive ?? true,
  }
}

/** Returns an error message, or null when the form can be submitted. */
function validate(
  form: ReturnType<typeof initialForm>,
  storageLimit: number,
  fileSizeLimit: number,
  isEditing: boolean,
) {
  if (!form.name.trim()) return 'Name is required'
  if (!Number.isFinite(storageLimit) || storageLimit <= 0) {
    return 'Storage limit must be a positive number'
  }
  if (!Number.isFinite(fileSizeLimit) || fileSizeLimit <= 0) {
    return 'File-size limit must be a positive number'
  }
  if (fileSizeLimit > storageLimit) {
    return 'File-size limit cannot exceed storage limit'
  }
  const credentials = [
    form.accessKeyId,
    form.secretAccessKey,
    form.endpoint,
    form.region,
    form.bucketName,
  ]
  if (!isEditing && credentials.some((value) => !value.trim())) {
    return 'All credential fields are required'
  }
  return null
}

/**
 * Add/edit dialog for a user storage provider. Mounted only while open, so
 * the form starts from `provider` every time. It stays open until the save
 * succeeds (the parent closes it).
 */
export function ProviderFormDialog({
  provider,
  isSaving,
  onSave,
  onClose,
}: ProviderFormDialogProps) {
  const isEditing = provider !== null
  const [form, setForm] = useState(() => initialForm(provider))
  const [storageLimitInput, setStorageLimitInput] = useState(() =>
    String(provider?.storageLimitBytes ?? DEFAULT_STORAGE_LIMIT),
  )
  const [fileSizeLimitInput, setFileSizeLimitInput] = useState(() =>
    String(provider?.fileSizeLimitBytes ?? DEFAULT_FILE_SIZE_LIMIT),
  )

  const submit = () => {
    const storageLimitBytes = Number(storageLimitInput)
    const fileSizeLimitBytes = Number(fileSizeLimitInput)
    const error = validate(
      form,
      storageLimitBytes,
      fileSizeLimitBytes,
      isEditing,
    )
    if (error) {
      toast.error(error)
      return
    }
    onSave({
      providerId: provider?.id,
      name: form.name.trim(),
      endpoint: form.endpoint.trim(),
      region: form.region.trim(),
      bucketName: form.bucketName.trim(),
      accessKeyId: form.accessKeyId.trim(),
      secretAccessKey: form.secretAccessKey.trim(),
      storageLimitBytes,
      fileSizeLimitBytes,
      proxyUploadsEnabled: form.proxyUploadsEnabled,
      isActive: form.isActive,
    })
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !isSaving) onClose()
      }}
    >
      <DialogContent className="w-[min(96vw,1100px)] max-w-[1100px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Storage Provider' : 'Add Storage Provider'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update your S3-compatible storage provider credentials.'
              : 'Enter your S3-compatible storage provider details. Credentials are encrypted at rest.'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ProviderEditorCard
            form={form}
            isEditing={isEditing}
            isSaving={isSaving}
            storageLimitInput={storageLimitInput}
            fileSizeLimitInput={fileSizeLimitInput}
            onChange={(field, value) =>
              setForm((prev) => ({ ...prev, [field]: value }))
            }
            onStorageLimitChange={setStorageLimitInput}
            onFileSizeLimitChange={setFileSizeLimitInput}
            onProxyUploadsEnabledChange={(value) =>
              setForm((prev) => ({ ...prev, proxyUploadsEnabled: value }))
            }
            onSubmit={submit}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
