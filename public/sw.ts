import { Hono } from 'https://cdn.jsdelivr.net/npm/hono@4.12.10/+esm'
const CACHE_VERSION = 'v2'
const CACHE_NAME = `storage-platform-${CACHE_VERSION}`
const app = new Hono().base('/sw')

const STATIC_ASSETS = ['/', '/auth', '/home', '/settings', '/recent']

app.use('*', async (c, next) => {
  const req = c.req.raw
  const url = new URL(req.url)

  if (req.method !== 'GET') {
    return await next()
  }

  const cache = await caches.open(CACHE_NAME)

  try {
    const response = await fetch(req)
    if (response.ok) {
      c.executionCtx.waitUntil(cache.put(req, response.clone()))
    }
    return response
  } catch (_err) {
    const cachedResponse = await cache.match(req)
    if (cachedResponse) {
      return cachedResponse
    }
    // Try static assets fallback for navigation
    if (req.mode === 'navigate') {
      const staticResponse = await cache.match('/')
      if (staticResponse) {
        return staticResponse
      }
    }
    throw _err
  }
})

self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(app.fetch(event.request, self as unknown as Env, event))
})

self.addEventListener('install', (event: ExtendableEvent) => {
  event
    .waitUntil(
      caches.keys().then(async (cacheNames) => {
        for (const name of cacheNames) {
          if (name.startsWith('storage-platform-') && name !== CACHE_NAME) {
            await caches.delete(name)
          }
        }
      }),
    )(self as unknown as { skipWaiting: () => void })
    .skipWaiting()
})

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    (
      self as unknown as { clients: { claim: () => Promise<void> } }
    ).clients.claim(),
  )
})
