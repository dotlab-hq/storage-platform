# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Commonly used commands for development:

- `pnpm dev`: Start the development server.
- `pnpm build`: Build the project for production.
- `pnpm test`: Run unit tests with Vitest (`vitest.config.ts`, plain Node; `src/**/*.test.ts`).
- `pnpm test:s3:compat`: Run S3 compatibility tests with Playwright.
- `pnpm lint`: Run ESLint.
- `pnpm types`: Run TypeScript type checking.
- `pnpm format`: Check formatting with Prettier.
- `pnpm check`: Run both formatting and linting fixes.
- `pnpm db:generate`: Generate Drizzle migrations.
- `pnpm db:migrate`: Run Drizzle migrations.
- `pnpm db:push`: Push Drizzle schema changes.
- `pnpm db:studio`: Open Drizzle Studio.

## Architecture

This project is a modern cloud storage platform using:

- **Frontend**: React 19, TypeScript, Tailwind CSS v4.
- **Routing**: TanStack Router (file-based routing). Routes are located in `src/routes/`. Note the use of route groups (folders starting with `_`) which define layouts without affecting the URL.
- **Backend/Server**: Nitro (Cloudflare Workers environment) with Hono via `@tanstack/react-start`.
- **Database**: Drizzle ORM with Cloudflare D1 (SQLite). Schema definitions reside in `src/db/` (though referenced as `src/db/schema/` in documentation, please verify via `drizzle.config.ts`).
- **State Management**: TanStack Query for server state, zustand (`src/stores/`) for shared client state.
- **Authentication**: `better-auth`.

Key Directories:
- `src/routes/`: TanStack Router file-based route definitions.
- `src/components/`: UI components.
- `src/lib/`: Shared utilities, data fetching queries, mutations, and stores.
- `src/db/`: Drizzle ORM schema and migrations.

## How a page works (follow this pattern)

1. **Queries** are `queryOptions` factories in a small module (e.g. `src/lib/storage/folder-query.ts`, `src/lib/storage/trash-query.ts`). Keys live in `src/lib/query-keys.ts`.
2. **Route loaders** prefetch them: `context.queryClient.ensureQueryData(xQuery(...))`. `src/router.tsx` creates one `QueryClient` per request and `setupRouterSsrQueryIntegration` ships the SSR cache to the browser, so pages render complete on first paint.
3. **Components** read the same options with `useSuspenseQuery` / `useSuspenseInfiniteQuery` — no `isLoading` spinners. Each route has a `pendingComponent` skeleton with the same layout as the page (shown only for slow navigations).
4. **Mutations** update the cache optimistically (helpers like `updateFolderItems`, `removeFolderItems`), toast on error, and invalidate in `onSettled`.
5. **Navigation state** (open folder, tab, trash path) lives in validated URL search params, not `useState`.
6. **Client state shared between components** lives in zustand stores in `src/stores/` (`ui-store` dialogs, `selection-store`, `upload-store`, `preferences-store`). Don't use window CustomEvents or module-level variables for this.
7. **Signed-in user**: `src/routes/_app.tsx` `beforeLoad` loads `currentUserQuery()` and redirects anonymous users to `/auth?redirect=...`. Inside `/_app`, call `useCurrentUser()` (`src/lib/auth/current-user.ts`); never call `authClient.getSession()` in components.
8. **Auth on the server**: `src/lib/auth/resolve-session.ts` is the single definition of "signed in"; the middlewares in `src/middlewares/` build on it. Mutations call `requireWritePermission(context.user)` so read-only device sessions can't write.
9. **No flicker rules**: no `lazy()` page + Suspense skeleton swaps, no `<ClientOnly>` swaps, no effects that copy loader data into state, dialogs mount only while open (see `src/components/storage/browser/storage-dialogs.tsx` and `src/lib/lazy-with-preload.ts`), and nothing that differs between server and client render (dates, `window`, `localStorage`).

Uploads (dialogs and drag-and-drop) all go through `src/lib/storage/upload-service.ts` via the `useUploader(folderId)` hook.

