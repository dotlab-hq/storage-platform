import { getObject, headObject } from '@/lib/s3-gateway/s3-object-store'
import { listDavChildren } from '@/lib/webdav/children'
import { resourceFromPath } from '@/lib/webdav/resources'
import type { WebDavPrincipal } from '@/lib/webdav/auth'
import type { WebDavPath } from '@/lib/webdav/path'
import { webDavHref } from '@/lib/webdav/path'
import { getLocks } from '@/lib/webdav/locks'
import { fixContentType } from '@/lib/webdav/mime'
import {
  davXmlResponse,
  emptyDavResponse,
  multiStatusXml,
  parsePropFindXml,
  resourcePropXml,
} from '@/lib/webdav/xml'

function davHeaders(): Headers {
  return new Headers({
    DAV: '1, 2',
    Allow:
      'OPTIONS, GET, HEAD, PUT, DELETE, MKCOL, COPY, MOVE, PROPFIND, PROPPATCH, LOCK, UNLOCK',
    'MS-Author-Via': 'DAV',
  })
}

export async function handleOptions(): Promise<Response> {
  return emptyDavResponse(204, davHeaders())
}

export async function handlePropfind(input: {
  request: Request
  path: WebDavPath
  principal: WebDavPrincipal
}): Promise<Response> {
  const href = webDavHref(input.path.bucketName, input.path.objectKey)
  const resource = await resourceFromPath({
    path: input.path,
    href,
    principal: input.principal,
  })
  if (resource instanceof Response) return resource

  const body = await input.request.text()
  const propfind = parsePropFindXml(body)
  const responses = [
    {
      href: resource.href,
      propstats: resourcePropXml(
        resource,
        propfind.names,
        propfind.mode,
        resource.bucketName
          ? getLocks(resource.bucketName, resource.objectKey)
          : [],
      ),
    },
  ]

  const depth = input.request.headers.get('depth') ?? 'infinity'
  if (depth !== '0' && resource.isCollection) {
    const children = await listDavChildren({
      principal: input.principal,
      bucket: resource.bucket,
      objectKey: resource.objectKey,
    })
    responses.push(
      ...children.map((child) => ({
        href: child.href,
        propstats: resourcePropXml(
          child,
          propfind.names,
          propfind.mode,
          child.bucketName ? getLocks(child.bucketName, child.objectKey) : [],
        ),
      })),
    )
  }

  return davXmlResponse(multiStatusXml(responses))
}

export async function handleGet(input: {
  request: Request
  path: WebDavPath
  principal: WebDavPrincipal
}): Promise<Response> {
  const resource = await resourceFromPath({
    path: input.path,
    href: webDavHref(input.path.bucketName, input.path.objectKey),
    principal: input.principal,
  })
  if (resource instanceof Response) return resource
  if (!resource.bucket || !resource.objectKey || resource.isCollection) {
    return handlePropfind({ ...input, request: input.request })
  }

  const object = await getObject(
    resource.bucket,
    resource.objectKey,
    {
      ifNoneMatch: input.request.headers.get('if-none-match'),
      ifModifiedSince: input.request.headers.get('if-modified-since'),
    },
    input.request.headers.get('range'),
  )
  if (!object) return new Response('Not found', { status: 404 })

  const ct = object.headers.get('Content-Type') ?? 'application/octet-stream'
  const fixed = fixContentType(resource.objectKey, ct)
  if (fixed !== ct) {
    object.headers.set('Content-Type', fixed)
  }
  return object
}

export async function handleHead(input: {
  request: Request
  path: WebDavPath
  principal: WebDavPrincipal
}): Promise<Response> {
  const resource = await resourceFromPath({
    path: input.path,
    href: webDavHref(input.path.bucketName, input.path.objectKey),
    principal: input.principal,
  })
  if (resource instanceof Response) return resource
  if (!resource.bucket || !resource.objectKey || resource.isCollection) {
    const headers = new Headers()
    headers.set('Content-Type', 'httpd/unix-directory')
    headers.set('Content-Length', '0')
    return new Response(null, { status: 200, headers })
  }

  const object = await headObject(resource.bucket, resource.objectKey, {
    ifNoneMatch: input.request.headers.get('if-none-match'),
    ifModifiedSince: input.request.headers.get('if-modified-since'),
  })
  if (!object) return new Response(null, { status: 404 })

  const ct = object.headers.get('Content-Type') ?? 'application/octet-stream'
  const fixed = fixContentType(resource.objectKey, ct)
  if (fixed !== ct) {
    object.headers.set('Content-Type', fixed)
  }
  return object
}
