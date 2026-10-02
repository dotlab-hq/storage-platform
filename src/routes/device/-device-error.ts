/** Turns a better-auth device-flow error into a readable message. */
export function deviceErrorMessage(error: unknown, fallback: string): string {
  if (typeof error !== 'object' || error === null) return fallback
  const { error_description, message } = error as {
    error_description?: unknown
    message?: unknown
  }
  if (typeof error_description === 'string' && error_description) {
    return error_description
  }
  if (typeof message === 'string' && message) return message
  return fallback
}
