export function formatBytes(bytes: number | null | undefined): string {
  const safeBytes =
    Number.isFinite(bytes) && typeof bytes === 'number' ? Math.max(0, bytes) : 0
  if (safeBytes === 0) return '0 bytes'
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const unitIndex = Math.min(
    Math.floor(Math.log(safeBytes) / Math.log(1024)),
    units.length - 1,
  )
  const size = safeBytes / Math.pow(1024, unitIndex)
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}
