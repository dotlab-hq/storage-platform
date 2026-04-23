import { trace } from '@opentelemetry/api'
import { AsyncLocalStorage } from 'node:async_hooks'

export const requestContext = new AsyncLocalStorage<Map<string, unknown>>()

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
