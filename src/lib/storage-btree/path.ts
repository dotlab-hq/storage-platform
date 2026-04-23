export function normalizePath(value: string): string {
  if (!value) return ''
  return value
    .split('/')
    .filter((segment) => segment.length > 0)
    .join('/')
}

export function joinPath(parent: string, name: string): string {
  const normalizedParent = normalizePath(parent)
  const normalizedName = normalizePath(name)
  if (!normalizedParent) return normalizedName
  if (!normalizedName) return normalizedParent
  return `${normalizedParent}/${normalizedName}`
}

export function descendantPrefix(path: string): string {
  const normalized = normalizePath(path)
  return normalized.length === 0 ? '' : `${normalized}/`
}
