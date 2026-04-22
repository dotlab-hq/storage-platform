export type PendingAction = 'create' | 'empty' | 'delete'
export type PendingByBucket = Record<string, PendingAction | undefined>

export async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T
}

export async function readApiError(
  response: Response,
  fallback: string,
): Promise<string> {
  const payload = await parseJson<{ error?: string }>(response)
  return payload.error ?? fallback
}
