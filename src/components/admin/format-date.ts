/**
 * Formats a date as YYYY-MM-DD. Unlike `toLocaleDateString` this gives the
 * same text on the server and in the browser, so it is safe to render on SSR.
 */
export function formatDate(value: Date | string | number) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toISOString().slice(0, 10)
}
