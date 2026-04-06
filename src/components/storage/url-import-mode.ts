import type { UrlImportMode } from '@/components/storage/url-import-dialog-types'

export const URL_IMPORT_MODE_STORAGE_KEY = 'dot_url_import_mode'
export const URL_IMPORT_MODE_EVENT = 'dot:url-import-mode-changed'

export function normalizeUrlImportMode(value: string | null): UrlImportMode {
  return value === 'code' ? 'code' : 'form'
}
