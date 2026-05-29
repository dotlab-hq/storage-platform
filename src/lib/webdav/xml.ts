import type { ActiveWebDavLock } from '@/lib/webdav/locks'
import type { WebDavResource } from '@/lib/webdav/resources'

const XML_TYPE = 'application/xml; charset=utf-8'

export type PropMode = 'allprop' | 'propname' | 'prop'

export type PropFindRequest = {
  mode: PropMode
  names: string[]
}

export type DavPropStatus = {
  status: number
  props: string[]
}

export type DavResponse = {
  href: string
  propstats: DavPropStatus[]
}

export function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function toDate(value: Date | number | string | null | undefined): Date {
  if (value instanceof Date) return value
  if (typeof value === 'number') return new Date(value * 1000)
  if (typeof value === 'string') {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed
  }
  return new Date(0)
}

export function davXmlResponse(body: string, status = 207): Response {
  return new Response(body, {
    status,
    headers: { 'Content-Type': XML_TYPE },
  })
}

export function emptyDavResponse(status: number, headers?: HeadersInit) {
  return new Response(null, { status, headers })
}

export function parsePropFindXml(body: string): PropFindRequest {
  const lower = body.toLowerCase()
  if (body.trim().length === 0 || lower.includes('<allprop')) {
    return { mode: 'allprop', names: [] }
  }
  if (lower.includes('<propname')) {
    return { mode: 'propname', names: [] }
  }
  const propMatch = body.match(/<[^:>]*:?prop\b[^>]*>([\s\S]*?)<\/[^:>]*:?prop>/i)
  const propBody = propMatch?.[1] ?? ''
  const names = Array.from(propBody.matchAll(/<([A-Za-z0-9_-]+:)?([A-Za-z0-9_-]+)\b/g))
    .map((match) => match[2])
    .filter((name) => name !== 'prop')
  return { mode: 'prop', names: Array.from(new Set(names)) }
}

export function parseProppatchNames(body: string): string[] {
  const matches = Array.from(body.matchAll(/<([A-Za-z0-9_-]+:)?([A-Za-z0-9_-]+)\b/g))
  const ignored = new Set(['propertyupdate', 'set', 'remove', 'prop'])
  return Array.from(
    new Set(matches.map((match) => match[2]).filter((name) => !ignored.has(name))),
  )
}

function statusLine(status: number): string {
  const text = status === 200 ? 'OK' : status === 403 ? 'Forbidden' : 'Not Found'
  return `HTTP/1.1 ${status} ${text}`
}

function propstatXml(propstat: DavPropStatus): string {
  const props = propstat.props.join('')
  return `<D:propstat><D:prop>${props}</D:prop><D:status>${statusLine(propstat.status)}</D:status></D:propstat>`
}

export function multiStatusXml(responses: DavResponse[]): string {
  const responseXml = responses
    .map(
      (item) =>
        `<D:response><D:href>${escapeXml(item.href)}</D:href>${item.propstats
          .map(propstatXml)
          .join('')}</D:response>`,
    )
    .join('')
  return `<?xml version="1.0" encoding="utf-8"?><D:multistatus xmlns:D="DAV:">${responseXml}</D:multistatus>`
}

function lockDiscoveryXml(locks: ActiveWebDavLock[]): string {
  const entries = locks
    .map(
      (lock) =>
        `<D:activelock><D:locktype><D:write/></D:locktype><D:lockscope><D:${lock.scope}/></D:lockscope><D:depth>${escapeXml(lock.depth)}</D:depth><D:owner>${escapeXml(lock.owner)}</D:owner><D:timeout>Second-${lock.timeoutSeconds}</D:timeout><D:locktoken><D:href>${escapeXml(lock.token)}</D:href></D:locktoken><D:lockroot><D:href>${escapeXml(lock.rootHref)}</D:href></D:lockroot></D:activelock>`,
    )
    .join('')
  return `<D:lockdiscovery>${entries}</D:lockdiscovery>`
}

export function lockInfoXml(lock: ActiveWebDavLock): string {
  return `<?xml version="1.0" encoding="utf-8"?><D:prop xmlns:D="DAV:">${lockDiscoveryXml([
    lock,
  ])}</D:prop>`
}

export function resourcePropXml(
  resource: WebDavResource,
  names: string[],
  mode: PropMode,
  locks: ActiveWebDavLock[],
): DavPropStatus[] {
  const available = new Map<string, string>([
    ['displayname', `<D:displayname>${escapeXml(resource.displayName)}</D:displayname>`],
    ['resourcetype', resource.isCollection ? '<D:resourcetype><D:collection/></D:resourcetype>' : '<D:resourcetype/>'],
    ['creationdate', `<D:creationdate>${escapeXml(toDate(resource.createdAt).toISOString())}</D:creationdate>`],
    ['getlastmodified', `<D:getlastmodified>${escapeXml(toDate(resource.lastModified).toUTCString())}</D:getlastmodified>`],
    ['getcontentlength', `<D:getcontentlength>${resource.size}</D:getcontentlength>`],
    ['getcontenttype', `<D:getcontenttype>${escapeXml(resource.contentType)}</D:getcontenttype>`],
    ['getetag', resource.etag ? `<D:getetag>${escapeXml(resource.etag)}</D:getetag>` : '<D:getetag/>'],
    ['supportedlock', '<D:supportedlock><D:lockentry><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype></D:lockentry><D:lockentry><D:lockscope><D:shared/></D:lockscope><D:locktype><D:write/></D:locktype></D:lockentry></D:supportedlock>'],
    ['lockdiscovery', lockDiscoveryXml(locks)],
  ])

  if (mode === 'propname') {
    return [{ status: 200, props: Array.from(available.keys()).map((name) => `<D:${name}/>`)}]
  }

  const wanted = mode === 'allprop' ? Array.from(available.keys()) : names
  const ok: string[] = []
  const missing: string[] = []
  for (const name of wanted) {
    const prop = available.get(name)
    if (prop) ok.push(prop)
    else missing.push(`<D:${name}/>`)
  }
  return [
    ...(ok.length > 0 ? [{ status: 200, props: ok }] : []),
    ...(missing.length > 0 ? [{ status: 404, props: missing }] : []),
  ]
}
