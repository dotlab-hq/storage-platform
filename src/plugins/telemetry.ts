import { defineNitroPlugin } from 'nitro/types'
import { tracer, requestContext } from '@/lib/telemetry'
import type { Span } from '@opentelemetry/api'

export default defineNitroPlugin((nitro) => {
  // Ensure runtime hooks are enabled
  nitro.options.features ||= {}
  nitro.options.features.runtimeHooks = true

  nitro.hooks.hook('request', async (event) => {
    const request = event.nodeReq
    const method = request.method ?? 'UNKNOWN'
    const url = request.url ?? 'unknown'
    const path = new URL(url, 'http://localhost').pathname

    // Extract user ID if available from auth
    let userId: string | undefined
    try {
      // Better-auth stores user in event.context? Use auth utility
      const auth = await event.context.get('auth')
      if (auth?.userId) userId = auth.userId
    } catch {
      // ignore
    }

    // Generate request ID
    const requestId = crypto.randomUUID()

    // Start span
    const span = tracer.startSpan(`HTTP ${method} ${path}`, {
      attributes: {
        'http.method': method,
        'http.url': url,
        'http.route': path,
        ...(userId ? ['user.id': userId] : {}),
        'request.id': requestId,
      },
    })

    // Store in async local storage
    requestContext.run(
      new Map<string, unknown>([
        ['requestId', requestId],
        ['userId', userId],
        ['span', span],
        ['path', path],
        ['method', method],
      ]),
      () => {
        // Continue handling
      },
    )
  })

  nitro.hooks.hook('response', async (event) => {
    const store = requestContext.getStore()
    const span = store?.get('span') as Span | undefined
    if (span) {
      span.setAttribute('http.status_code', event.nodeRes.statusCode.toString())
      span.end()
    }
  })

  nitro.hooks.hook('error', async (event) => {
    const store = requestContext.getStore()
    const span = store?.get('span') as Span | undefined
    if (span) {
      span.setStatus({
        code: 'ERROR',
        message: event.error.message,
      })
      span.recordException(event.error)
    }
  })
})
