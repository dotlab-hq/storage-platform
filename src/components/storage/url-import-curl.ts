import type { UrlImportDialogState } from '@/components/storage/url-import-dialog-types'

type ParsedCurl = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH'
  url: string
  headersRaw: string
  cookiesRaw: string
}

const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH'])
const FORBIDDEN_TOKENS = [';', '|', '&&', '$(', '`', '>', '<']
const ALLOWED_FLAGS = new Set(['-X', '--request', '-H', '--header'])

function shellEscape(value: string): string {
  return `'${value.replace(/'/g, `'"'"'`)}'`
}

function splitArgs(command: string): string[] {
  const args: string[] = []
  let current = ''
  let quote: 'single' | 'double' | null = null

  for (let index = 0; index < command.length; index += 1) {
    const char = command[index]
    if (quote === null && (char === ' ' || char === '\t' || char === '\n')) {
      if (current.length > 0) {
        args.push(current)
        current = ''
      }
      continue
    }

    if (char === "'" && quote !== 'double') {
      quote = quote === 'single' ? null : 'single'
      continue
    }
    if (char === '"' && quote !== 'single') {
      quote = quote === 'double' ? null : 'double'
      continue
    }
    current += char
  }

  if (current.length > 0) {
    args.push(current)
  }
  return args
}

function toHeaderLines(headers: string[]): string {
  return headers.join('\n')
}

function toCookieLines(cookieHeader: string | null): string {
  if (!cookieHeader) {
    return ''
  }
  return cookieHeader
    .split(';')
    .map((pair) => pair.trim())
    .filter((pair) => pair.length > 0)
    .map((pair) => {
      const separatorIndex = pair.indexOf('=')
      if (separatorIndex <= 0) {
        return `${pair}:`
      }
      const key = pair.slice(0, separatorIndex).trim()
      const value = pair.slice(separatorIndex + 1).trim()
      return `${key}:${value}`
    })
    .join('\n')
}

export function buildCurlFromState(state: UrlImportDialogState): string {
  const segments = ['curl', '-X', state.method, shellEscape(state.url)]

  const headerLines = state.headersRaw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
  for (const line of headerLines) {
    segments.push('-H', shellEscape(line))
  }

  const cookies = state.cookiesRaw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
  if (cookies.length > 0) {
    const cookieHeader = cookies
      .map((line) => {
        const separatorIndex = line.indexOf(':')
        if (separatorIndex <= 0) {
          return line
        }
        const key = line.slice(0, separatorIndex).trim()
        const value = line.slice(separatorIndex + 1).trim()
        return `${key}=${value}`
      })
      .join('; ')
    segments.push('-H', shellEscape(`Cookie: ${cookieHeader}`))
  }

  return segments.join(' ')
}

export function parseCurlToState(
  command: string,
): { ok: true; parsed: ParsedCurl } | { ok: false; error: string } {
  const trimmed = command.trim()
  if (!trimmed.startsWith('curl ')) {
    return { ok: false, error: 'Only curl commands are supported.' }
  }
  for (const token of FORBIDDEN_TOKENS) {
    if (trimmed.includes(token)) {
      return {
        ok: false,
        error: `Forbidden token detected: ${token}. Only plain curl is allowed.`,
      }
    }
  }

  const args = splitArgs(trimmed)
  let method: ParsedCurl['method'] = 'GET'
  const headers: string[] = []
  let url: string | null = null
  let cookieHeader: string | null = null
  let trailingTokens = 0

  for (let index = 1; index < args.length; index += 1) {
    const token = args[index]
    if ((token === '-X' || token === '--request') && args[index + 1]) {
      const candidate = args[index + 1].toUpperCase()
      if (!ALLOWED_METHODS.has(candidate)) {
        return { ok: false, error: `Method ${candidate} is not allowed.` }
      }
      method = candidate as ParsedCurl['method']
      index += 1
      continue
    }

    if ((token === '-H' || token === '--header') && args[index + 1]) {
      const header = args[index + 1]
      if (header.toLowerCase().startsWith('cookie:')) {
        cookieHeader = header.slice('cookie:'.length).trim()
      } else {
        headers.push(header)
      }
      index += 1
      continue
    }

    if (token.startsWith('-')) {
      if (!ALLOWED_FLAGS.has(token)) {
        return { ok: false, error: `Unsupported flag: ${token}` }
      }
      continue
    }

    if (url === null) {
      url = token
    } else {
      trailingTokens += 1
    }
  }

  if (!url) {
    return { ok: false, error: 'cURL command must include a URL.' }
  }
  if (trailingTokens > 0) {
    return {
      ok: false,
      error: 'Unexpected extra tokens in cURL command.',
    }
  }
  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return { ok: false, error: 'Only http/https URLs are allowed.' }
    }
  } catch {
    return { ok: false, error: 'Invalid URL in cURL command.' }
  }

  return {
    ok: true,
    parsed: {
      method,
      url,
      headersRaw: toHeaderLines(headers),
      cookiesRaw: toCookieLines(cookieHeader),
    },
  }
}
