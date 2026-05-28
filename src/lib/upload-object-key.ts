const FALLBACK_FILE_BASE = 'file'

type UploadObjectKeyInput = {
  segments: string[]
  fileName: string
  uniqueId?: string
}

function sanitizeFileBase(value: string): string {
  return (
    value.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '') ||
    FALLBACK_FILE_BASE
  )
}

function sanitizeExtension(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '')
}

export function buildUploadObjectKey(input: UploadObjectKeyInput): string {
  const dotIndex = input.fileName.lastIndexOf('.')
  const base = sanitizeFileBase(
    dotIndex > 0 ? input.fileName.slice(0, dotIndex) : input.fileName,
  )
  const extension =
    dotIndex > 0 ? sanitizeExtension(input.fileName.slice(dotIndex + 1)) : ''
  const suffix = input.uniqueId ?? crypto.randomUUID()
  const fileName =
    extension.length > 0
      ? `${base}-${suffix}.${extension}`
      : `${base}-${suffix}`

  return [...input.segments, fileName]
    .filter((segment) => segment.length > 0)
    .join('/')
}
