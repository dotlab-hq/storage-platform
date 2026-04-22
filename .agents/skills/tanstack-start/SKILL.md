---
name: tanstack-start
description: >-
  TanStack Start full-stack React framework. Use for: server functions with
  createServerFn, TanStack Router file-based routing, TanStack Query SSR integration,
  Cloudflare Workers deployment.
---

# TanStack Start

Full-stack React framework with SSR, server functions, and Vite bundling.

## Project Setup

**New project:**

```bash
pnpm create cloudflare@latest my-app --framework=tanstack-start -y --no-deploy
```

**Existing app:** See [references/migration.md](references/migration.md) for converting React/Vite apps.

## Critical Configuration

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tanstackStart(),
    viteReact(), // MUST come AFTER tanstackStart
  ],
})
```

### tsconfig.json gotcha

Do NOT enable `verbatimModuleSyntax` - it leaks server bundles into client bundles.

## Server Functions

See [references/server-functions.md](references/server-functions.md) for complete guide.

> ⚠️ **Critical**: Route loaders run on server for initial SSR, but run on **CLIENT** during navigation. Always wrap server code in `createServerFn()` to ensure it runs server-side.

**When to use what (Cloudflare Workers):**

| Use Case                               | Solution                                   |
| -------------------------------------- | ------------------------------------------ |
| Server code in route loaders           | `createServerFn()`                         |
| Server code from client event handlers | API routes (`server.handlers`) work best   |
| Access Cloudflare bindings             | `import { env } from 'cloudflare:workers'` |

**createServerFn** - for loaders:

```typescript
import { createServerFn } from '@tanstack/react-start'

export const getData = createServerFn().handler(async () => {
  return { data: process.env.SECRET } // Server-only
})
```

**API routes** - for client event handlers:

```tsx
// routes/api/users.ts
export const Route = createFileRoute('/api/users')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json()
        return Response.json(await db.users.create(body))
      },
    },
  },
})

// In component: fetch('/api/users', { method: 'POST', body: JSON.stringify(data) })
```

**Key APIs:**

- `createServerFn()` - Server-only functions for loaders
- `server.handlers` - API routes for client event handlers
- `createMiddleware({ type: 'function' })` - Reusable middleware
- `@tanstack/react-start/server`: `getRequestHeaders()`, `setResponseHeader()`, `getCookies()`

## Routing

See [references/routing.md](references/routing.md) for complete patterns.

**File conventions** in `src/routes/`:
| Pattern | Route |
|---------|-------|
| `index.tsx` | `/` |
| `posts.$postId.tsx` | `/posts/:postId` |
| `_layout.tsx` | Layout (no URL) |
| `__root.tsx` | Root layout (required) |

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

const getPost = createServerFn().handler(async () => await db.post.findFirst())

export const Route = createFileRoute('/posts/$postId')({
  loader: ({ params }) => getPost({ data: params.postId }),
  component: () => {
    const post = Route.useLoaderData()
    return <h1>{post.title}</h1>
  },
})
```

## Cloudflare Deployment

See [references/cloudflare-deployment.md](references/cloudflare-deployment.md) for complete guide.

```bash
pnpm add -D @cloudflare/vite-plugin wrangler
```

**vite.config.ts** - add cloudflare plugin:

```typescript
import { cloudflare } from '@cloudflare/vite-plugin'
// Add to plugins: cloudflare({ viteEnvironment: { name: 'ssr' } })
```

**wrangler.jsonc**:

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "my-app",
  "compatibility_date": "<CURRENT_DATE>", // Use today's YYYY-MM-DD
  "compatibility_flags": ["nodejs_compat"],
  "main": "@tanstack/react-start/server-entry",
  "observability": { "enabled": true },
}
```

**Access Cloudflare bindings** in server functions:

```typescript
import { env } from 'cloudflare:workers'
const value = await env.MY_KV.get('key')
```

**Static Prerendering** (v1.138.0+):

```typescript
tanstackStart({ prerender: { enabled: true } })
```

## TanStack Query Integration

See [references/query-integration.md](references/query-integration.md) for SSR setup.

```bash
pnpm add @tanstack/react-query @tanstack/react-router-ssr-query
```

```tsx
// Preload in loaders, consume with useSuspenseQuery
loader: ({ context }) => context.queryClient.ensureQueryData(myQueryOptions)
```

## Better-Auth Integration

See [references/better-auth.md](references/better-auth.md) for complete guide.

> ⚠️ **Critical**: Use `createFileRoute` with `server.handlers`, NOT the legacy `createAPIFileRoute`.

**Mount the auth handler** at `/src/routes/api/auth/$.ts`:

```typescript
import { auth } from '@/lib/auth'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
      POST: ({ request }) => auth.handler(request),
    },
  },
})
```

**Auth config** with `tanstackStartCookies` plugin:

```typescript
import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

export const auth = betterAuth({
  // ...your config
  plugins: [tanstackStartCookies()], // MUST be last plugin
})
```

**Protect routes** with middleware:

```typescript
import { createMiddleware } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth } from './auth'

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const session = await auth.api.getSession({ headers: getRequestHeaders() })
  if (!session) throw redirect({ to: '/login' })
  return next()
})

// In route:
export const Route = createFileRoute('/dashboard')({
  server: { middleware: [authMiddleware] },
  component: Dashboard,
})
```

---

name: react-start
description: >-
React bindings for TanStack Start: createStart, StartClient,
StartServer, React-specific imports, re-exports from
@tanstack/react-router, full project setup with React, useServerFn
hook.
type: framework
library: tanstack-start
library_version: '1.166.2'
framework: react
requires:

- start-core
  sources:
- TanStack/router:packages/react-start/src
- TanStack/router:docs/start/framework/react/build-from-scratch.md

---

# React Start (`@tanstack/react-start`)

This skill builds on start-core. Read [start-core](../../../start-client-core/skills/start-core/SKILL.md) first for foundational concepts.

This skill covers the React-specific bindings, setup, and patterns for TanStack Start.

> **CRITICAL**: All code is ISOMORPHIC by default. Loaders run on BOTH server and client. Use `createServerFn` for server-only logic.

> **CRITICAL**: Do not confuse `@tanstack/react-start` with Next.js or Remix. They are completely different frameworks with different APIs.

> **CRITICAL**: Types are FULLY INFERRED. Never cast, never annotate inferred values.

## Package API Surface

`@tanstack/react-start` re-exports everything from `@tanstack/start-client-core` plus:

- `useServerFn` — React hook for calling server functions from components

All core APIs (`createServerFn`, `createMiddleware`, `createStart`, `createIsomorphicFn`, `createServerOnlyFn`, `createClientOnlyFn`) are available from `@tanstack/react-start`.

Server utilities (`getRequest`, `getRequestHeader`, `setResponseHeader`, `setResponseHeaders`, `setResponseStatus`) are imported from `@tanstack/react-start/server`.

## Full Project Setup

### 1. Install Dependencies

```bash
npm i @tanstack/react-start @tanstack/react-router react react-dom
npm i -D vite @vitejs/plugin-react typescript @types/react @types/react-dom
```

### 2. package.json

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "start": "node .output/server/index.mjs"
  }
}
```

### 3. tsconfig.json

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "moduleResolution": "Bundler",
    "module": "ESNext",
    "target": "ES2022",
    "skipLibCheck": true,
    "strictNullChecks": true
  }
}
```

### 4. vite.config.ts

```ts
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    tanstackStart(), // MUST come before react()
    viteReact(),
  ],
})
```

### 5. Router Factory (src/router.tsx)

```tsx
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
  })
  return router
}
```

### 6. Root Route (src/routes/\_\_root.tsx)

```tsx
import type { ReactNode } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'My TanStack Start App' },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
```

### 7. Index Route (src/routes/index.tsx)

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

const getGreeting = createServerFn({ method: 'GET' }).handler(async () => {
  return 'Hello from TanStack Start!'
})

export const Route = createFileRoute('/')({
  loader: () => getGreeting(),
  component: HomePage,
})

function HomePage() {
  const greeting = Route.useLoaderData()
  return <h1>{greeting}</h1>
}
```

## useServerFn Hook

Use `useServerFn` to call server functions from React components with proper integration:

```tsx
import { createServerFn, useServerFn } from '@tanstack/react-start'

const updatePost = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string; title: string }) => data)
  .handler(async ({ data }) => {
    await db.posts.update(data.id, { title: data.title })
    return { success: true }
  })

function EditPostForm({ postId }: { postId: string }) {
  const updatePostFn = useServerFn(updatePost)
  const [title, setTitle] = useState('')

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        await updatePostFn({ data: { id: postId, title } })
      }}
    >
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <button type="submit">Save</button>
    </form>
  )
}
```

## Global Start Configuration (src/start.ts)

```tsx
import { createStart, createMiddleware } from '@tanstack/react-start'

const requestLogger = createMiddleware().server(async ({ next, request }) => {
  console.log(`${request.method} ${request.url}`)
  return next()
})

export const startInstance = createStart(() => ({
  requestMiddleware: [requestLogger],
}))
```

## React-Specific Components

All routing components from `@tanstack/react-router` work in Start:

- `<RouterProvider>` — not needed in Start (handled automatically)
- `<Outlet>` — renders matched child route
- `<Link>` — type-safe navigation
- `<Navigate>` — declarative redirect
- `<HeadContent>` — renders head tags (must be in `<head>`)
- `<Scripts>` — renders body scripts (must be in `<body>`)
- `<Await>` — renders deferred data with Suspense
- `<ClientOnly>` — renders children only after hydration
- `<CatchBoundary>` — error boundary

## Hooks Reference

All hooks from `@tanstack/react-router` work in Start:

- `useRouter()` — router instance
- `useRouterState()` — subscribe to router state
- `useNavigate()` — programmatic navigation
- `useSearch({ from })` — validated search params
- `useParams({ from })` — path params
- `useLoaderData({ from })` — loader data
- `useMatch({ from })` — full route match
- `useRouteContext({ from })` — route context
- `Route.useLoaderData()` — typed loader data (preferred in route files)
- `Route.useSearch()` — typed search params (preferred in route files)

## Common Mistakes

### 1. CRITICAL: Importing from wrong package

```tsx
// WRONG — this is the SPA router, NOT Start
import { createServerFn } from '@tanstack/react-router'

// CORRECT — server functions come from react-start
import { createServerFn } from '@tanstack/react-start'

// CORRECT — routing APIs come from react-router (re-exported by Start too)
import { createFileRoute, Link } from '@tanstack/react-router'
```

### 2. HIGH: Using React hooks in beforeLoad or loader

```tsx
// WRONG — beforeLoad/loader are NOT React components
beforeLoad: () => {
  const auth = useAuth() // React hook, cannot be used here
}

// CORRECT — pass state via router context
const rootRoute = createRootRouteWithContext<{ auth: AuthState }>()({})
```

### 3. HIGH: Missing Scripts component

Without `<Scripts />` in the root route's `<body>`, client JavaScript doesn't load and the app won't hydrate.

## Cross-References

- [start-core](../../../start-client-core/skills/start-core/SKILL.md) — core Start concepts
- [router-core](../../../router-core/skills/router-core/SKILL.md) — routing fundamentals
- [react-router](../../../react-router/skills/react-router/SKILL.md) — React Router hooks and components
