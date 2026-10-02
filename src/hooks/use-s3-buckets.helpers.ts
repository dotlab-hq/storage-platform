export type PendingAction = 'create' | 'empty' | 'delete'
export type PendingByBucket = Record<string, PendingAction | undefined>

/** Parses a JSON body, returning null when the body is empty or not JSON. */
export async function readJsonSafely<T>(response: Response): Promise<T | null> {
  const text = await response.text().catch(() => '')
  if (!text) return null
  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

/**
 * Builds an error message from a failed response: the JSON `error` field if
 * present, otherwise the text body or the HTTP status.
 */
export async function readApiError(
  response: Response,
  fallback: string,
): Promise<string> {
  const text = await response.text().catch(() => '')
  try {
    const payload = JSON.parse(text) as { error?: unknown }
    if (typeof payload.error === 'string' && payload.error) return payload.error
  } catch {
    if (text.trim() && text.length < 300) return text.trim()
  }
  return response.status ? `${fallback} (HTTP ${response.status})` : fallback
}
