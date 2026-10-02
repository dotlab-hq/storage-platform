import { trace } from '@opentelemetry/api'
import type { Span, SpanKind } from '@opentelemetry/api'
import { AsyncLocalStorage } from 'node:async_hooks'

export const requestContext = new AsyncLocalStorage<Map<string, unknown>>()

export const tracer = trace.getTracer('storage-platform')

export function startSpan<T>(
  name: string,
  fn: (span: Span) => T,
  kind?: SpanKind,
): T {
  return tracer.startActiveSpan(name, { kind }, (span) => {
    try {
      return fn(span)
    } finally {
      span.end()
    }
  })
}

export function getCurrentSpan(): Span | undefined {
  return trace.getActiveSpan()
}
