const KIMI_K2_MODEL = 'kimi-k2'

const DEFAULT_OLLAMA_BASE_URL = 'http://127.0.0.1:11434'
const DEFAULT_LARGE_FILE_BYTES = 2 * 1024 * 1024
const DEFAULT_MAX_TEXT_BYTES = 256 * 1024
const DEFAULT_MAX_INPUT_CHARS = 12000

type SummaryLimits = {
  largeFileBytes: number
  maxTextBytes: number
  maxInputChars: number
}

function toPositiveInteger(
  rawValue: string | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  if (!rawValue) return fallback
  const parsed = Number.parseInt(rawValue, 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(maximum, Math.max(minimum, parsed))
}

export function getFileSummaryModelName(): string {
  const configured = (process.env.OLLAMA_MODEL ?? '').trim()

  if (!configured) {
    throw new Error('Missing OLLAMA_MODEL environment variable.')
  }

  if (configured !== KIMI_K2_MODEL) {
    throw new Error(
      `Unsupported OLLAMA_MODEL "${configured}". Only "${KIMI_K2_MODEL}" is allowed.`,
    )
  }

  return configured
}

export function getFileSummaryOllamaBaseUrl(): string {
  const configured = (process.env.OLLAMA_BASE_URL ?? '').trim()
  return configured.length > 0 ? configured : DEFAULT_OLLAMA_BASE_URL
}

export function getFileSummaryLimits(): SummaryLimits {
  return {
    largeFileBytes: toPositiveInteger(
      process.env.FILE_SUMMARY_LARGE_FILE_BYTES,
      DEFAULT_LARGE_FILE_BYTES,
      64 * 1024,
      64 * 1024 * 1024,
    ),
    maxTextBytes: toPositiveInteger(
      process.env.FILE_SUMMARY_MAX_TEXT_BYTES,
      DEFAULT_MAX_TEXT_BYTES,
      8 * 1024,
      2 * 1024 * 1024,
    ),
    maxInputChars: toPositiveInteger(
      process.env.FILE_SUMMARY_MAX_INPUT_CHARS,
      DEFAULT_MAX_INPUT_CHARS,
      1200,
      24000,
    ),
  }
}
