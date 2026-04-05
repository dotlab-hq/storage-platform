
import { Hono } from 'hono'

const CACHE_NAME = 'storage-platform-v1'
const app = new Hono()

app.use('*', async (c, next) => {
  const req = c.req.raw
  const url = new URL(req.url)

  // Avoid caching non-GET requests or APIs directly if not wanted,
  // but the instruction says: "Cache the entire system as an offline version on load... When the application reconnects to the internet, sync all user data."
  if (req.method !== 'GET') {
    // For mutations, we would ideally store them in IndexedDB (TanStack DB / Store) 
    // and sync them when online.
    return await next()
  }

  const cache = await caches.open(CACHE_NAME)
  
  try {
    const response = await fetch(req)
    // Update the cache with the new response
    if (response.ok) {
      c.executionCtx.waitUntil(cache.put(req, response.clone()))
    }
    return response
  } catch (err) {
    // Return cached fallback if offline
    const cachedResponse = await cache.match(req)
    if (cachedResponse) {
      return cachedResponse
    }
    throw err
  }
})

// @ts-expect-error - Service Worker types
self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(app.fetch(event.request, self as unknown as Env, event))
})

// @ts-expect-error - Service Worker types
self.addEventListener('install', (event: ExtendableEvent) => {
  // Discard the entire cache if a new version is detected
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  // @ts-expect-error
  self.skipWaiting()
})

// @ts-expect-error
self.addEventListener('activate', (event: ExtendableEvent) => {
  // @ts-expect-error
  event.waitUntil(self.clients.claim())
})
