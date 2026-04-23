export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  userId?: string
  requestId?: string
  tags?: string[]
  meta?: Record<string, unknown>
}

const getTimestamp = (): string => {
  return new Date().toISOString()
}

export function log(
  level: LogLevel,
  message: string,
  opts?: {
    userId?: string
    requestId?: string
    tags?: string[]
    meta?: Record<string, unknown>
  },
): void {
  const entry: LogEntry = {
    timestamp: getTimestamp(),
    level,
    message,
    ...opts,
  }
  console.log(JSON.stringify(entry))
}

export function debug(
  message: string,
  opts?: {
    userId?: string
    requestId?: string
    tags?: string[]
    meta?: Record<string, unknown>
  },
) {
  log('debug', message, opts)
}

export function info(
  message: string,
  opts?: {
    userId?: string
    requestId?: string
    tags?: string[]
    meta?: Record<string, unknown>
  },
) {
  log('info', message, opts)
}

export function warn(
  message: string,
  opts?: {
    userId?: string
    requestId?: string
    tags?: string[]
    meta?: Record<string, unknown>
  },
) {
  log('warn', message, opts)
}

export function error(
  message: string,
  opts?: {
    userId?: string
    requestId?: string
    tags?: string[]
    meta?: Record<string, unknown>
  },
) {
  log('error', message, opts)
}
