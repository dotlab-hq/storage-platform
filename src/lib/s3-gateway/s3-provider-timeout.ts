function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback
  }
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const PROVIDER_REQUEST_TIMEOUT_MS = parsePositiveInt(
  process.env.S3_PROVIDER_REQUEST_TIMEOUT_MS,
  120_000,
)

export class ProviderRequestTimeoutError extends Error {
  readonly timeoutMs: number

  constructor(timeoutMs: number) {
    super(`Upstream storage request timed out after ${timeoutMs}ms`)
    this.name = 'ProviderRequestTimeoutError'
    this.timeoutMs = timeoutMs
  }
}

export async function sendWithProviderTimeout<T>(
  requestFactory: (abortSignal: AbortSignal) => Promise<T>,
): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(
    () => controller.abort(),
    PROVIDER_REQUEST_TIMEOUT_MS,
  )
  try {
    return await requestFactory(controller.signal)
  } catch (error) {
    if (controller.signal.aborted) {
      throw new ProviderRequestTimeoutError(PROVIDER_REQUEST_TIMEOUT_MS)
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}
