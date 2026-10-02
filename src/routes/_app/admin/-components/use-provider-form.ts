import { useState } from 'react'
import type { AdminProvider } from '@/lib/storage-provider-queries'
import type { SaveProviderInput } from './use-admin-provider-mutations'

export type ProviderTextField =
  | 'name'
  | 'endpoint'
  | 'region'
  | 'bucketName'
  | 'accessKeyId'
  | 'secretAccessKey'

const DEFAULT_STORAGE_LIMIT = 10 * 1024 * 1024 * 1024
const DEFAULT_FILE_SIZE_LIMIT = 100 * 1024 * 1024

const emptyForm = {
  name: '',
  endpoint: '',
  region: '',
  bucketName: '',
  accessKeyId: '',
  secretAccessKey: '',
  proxyUploadsEnabled: false,
  isActive: true,
}

type ParseResult =
  | { ok: true; data: SaveProviderInput }
  | { ok: false; error: string }

/**
 * State of the "Add / edit provider" form. Limits are kept as raw strings so
 * the inputs can hold partial values while typing.
 */
export function useProviderForm() {
  const [form, setForm] = useState(emptyForm)
  const [editingProviderId, setEditingProviderId] = useState<string | null>(
    null,
  )
  const [storageLimitInput, setStorageLimitInput] = useState(
    String(DEFAULT_STORAGE_LIMIT),
  )
  const [fileSizeLimitInput, setFileSizeLimitInput] = useState(
    String(DEFAULT_FILE_SIZE_LIMIT),
  )

  const setField = (field: ProviderTextField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const setProxyUploadsEnabled = (value: boolean) => {
    setForm((prev) => ({ ...prev, proxyUploadsEnabled: value }))
  }

  const reset = () => {
    setEditingProviderId(null)
    setForm(emptyForm)
    setStorageLimitInput(String(DEFAULT_STORAGE_LIMIT))
    setFileSizeLimitInput(String(DEFAULT_FILE_SIZE_LIMIT))
  }

  /** Loads an existing provider into the form (secrets are left blank). */
  const edit = (provider: AdminProvider) => {
    setEditingProviderId(provider.id)
    setForm({
      name: provider.name,
      endpoint: provider.endpoint,
      region: provider.region,
      bucketName: provider.bucketName,
      accessKeyId: '',
      secretAccessKey: '',
      proxyUploadsEnabled: provider.proxyUploadsEnabled,
      isActive: provider.isActive,
    })
    setStorageLimitInput(String(provider.storageLimitBytes))
    setFileSizeLimitInput(String(provider.fileSizeLimitBytes))
  }

  /** Validates the form and builds the save payload. */
  const parse = (): ParseResult => {
    const storageLimitBytes = Number(storageLimitInput)
    const fileSizeLimitBytes = Number(fileSizeLimitInput)
    if (!Number.isFinite(storageLimitBytes) || storageLimitBytes <= 0) {
      return { ok: false, error: 'Storage limit must be a positive number' }
    }
    if (!Number.isFinite(fileSizeLimitBytes) || fileSizeLimitBytes <= 0) {
      return { ok: false, error: 'File-size limit must be a positive number' }
    }
    if (fileSizeLimitBytes > storageLimitBytes) {
      return { ok: false, error: 'File-size limit cannot exceed storage limit' }
    }
    if (!form.name.trim()) {
      return { ok: false, error: 'Provider name is required' }
    }
    return {
      ok: true,
      data: {
        ...form,
        providerId: editingProviderId ?? undefined,
        storageLimitBytes,
        fileSizeLimitBytes,
        isActive: true,
      },
    }
  }

  return {
    form,
    isEditing: editingProviderId !== null,
    storageLimitInput,
    fileSizeLimitInput,
    setField,
    setProxyUploadsEnabled,
    setStorageLimitInput,
    setFileSizeLimitInput,
    edit,
    reset,
    parse,
  }
}
