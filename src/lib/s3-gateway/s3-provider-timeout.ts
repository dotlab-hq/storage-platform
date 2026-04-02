const PROVIDER_REQUEST_TIMEOUT_MS = 20_000

export async function sendWithProviderTimeout<T>(
    requestFactory: ( abortSignal: AbortSignal ) => Promise<T>,
): Promise<T> {
    const controller = new AbortController()
    const timer = setTimeout( () => controller.abort(), PROVIDER_REQUEST_TIMEOUT_MS )
    try {
        return await requestFactory( controller.signal )
    } finally {
        clearTimeout( timer )
    }
}
