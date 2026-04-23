import { trace } from '@opentelemetry/api'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-base'
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
import type { SpanExporter } from '@opentelemetry/sdk-trace-base'
import { AutoDetectResources } from '@opentelemetry/resources'
import { AsyncLocalStorage } from 'node:async_hooks'

// Custom console exporter that logs spans as JSON
class ConsoleSpanExporter implements SpanExporter {
  async forceFlush(): Promise<boolean> {
    return true
  }
  async shutdown(): Promise<void> {
    // nothing to clean up
  }
  export(spans: import('@opentelemetry/sdk-trace-base').ReadableSpan[]): void {
    for (const span of spans) {
      const resourceSpans = span.resourceSpan
      // Serialize span to JSON and log
      const spanData = {
        traceId: span.spanContext().traceId,
        spanId: span.spanContext().spanId,
        parentSpanId: span.parentSpanId,
        name: span.name,
        kind: span.kind,
        status: span.status(),
        attributes: span.attributes(),
        startTime: span.startTime,
        endTime: span.endTime,
        durationMs: span.duration,
        resource: {
          ...span.resource?.labels,
        },
      }
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          type: 'span',
          data: spanData,
        }),
      )
    }
  }
}

// AsyncLocalStorage for request context propagation
export const requestContext = new AsyncLocalStorage<Record<string, unknown>>()

// Initialize tracer provider
const provider = new NodeTracerProvider({
  resource: new AutoDetectResources(),
})

provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()))
provider.register()

// Export convenience functions
export const tracer = trace.getTracer('storage-platform')

export function startSpan<T>(
  name: string,
  fn: (span: import('@opentelemetry/api').Span) => T,
  kind?: import('@opentelemetry/api').SpanKind,
): T {
  return tracer.startActiveSpan(name, { kind }, (span) => {
    try {
      return fn(span)
    } finally {
      span.end()
    }
  })
}

export function getCurrentSpan():
  | import('@opentelemetry/api').Span
  | undefined {
  return trace.getActiveSpan()
}
