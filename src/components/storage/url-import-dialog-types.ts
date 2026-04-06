export type UrlImportMode = 'form' | 'code'

export type UrlImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentFolderId: string | null
  onImportComplete: () => Promise<void> | void
}

export type UrlImportDialogState = {
  mode: UrlImportMode
  url: string
  savePath: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH'
  headersRaw: string
  cookiesRaw: string
  curlCommand: string
  jobId: string | null
}

export type KeyValue = {
  key: string
  value: string
}

export type UrlValidationState = {
  loading: boolean
  ok: boolean
  message: string
}
