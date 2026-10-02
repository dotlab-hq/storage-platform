/**
 * Formats a date the same way on the server and in every browser
 * (`2026-10-02 14:05 UTC`), so SSR output never mismatches on hydration.
 */
export function formatDateTime(value: Date | string) {
  const iso = new Date(value).toISOString()
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`
}

/** Date-only variant of `formatDateTime` (`2026-10-02`). */
export function formatDate(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10)
}
