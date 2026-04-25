# Storage Platform

A modern cloud storage service built with a Google Drive-like experience, using S3-compatible providers as a backend. Supports multiple storage providers, offline caching, file synchronization, and a seamless UI.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4
- **Routing**: TanStack Router (file-based routing)
- **Data Fetching**: TanStack Query, Tanstack Store
- **Backend**: Hono (via @tanstack/react-start), Cloudflare Workers, Nitro
- **Database**: Drizzle ORM + Cloudflare D1 (SQLite)
- **Auth**: better-auth
- **Validation**: Zod

## Getting Started

```bash
pnpm install
pnpm dev
```

## Building for Production

```bash
pnpm build
```

## Project Structure

```
src/
├── components/         # UI components
│   ├── storage/       # Storage-specific components (modals, grid, upload)
│   ├── ui/            # Reusable UI from Radix/shadcn
│   └── ...
├── routes/            # TanStack Router file-based routes
│   ├── __root.tsx     # Root layout
│   ├── _app/          # Route group for authenticated app area
│   │   ├── index.tsx  # Main storage page (home)
│   │   ├── chat/      # Chat feature
│   │   ├── settings/  # User settings
│   │   └── ...
│   └── ...
├── lib/               # Utilities, queries, mutations, stores
├── db/                # Drizzle schemas
└── hooks/             # Custom React hooks
```

**Note on `_app/`:** This is a **TanStack Router route group**. The `_` prefix groups routes under a common layout without affecting the URL. It is not a legacy Next.js pattern.

## Key Features

- **Multi-provider storage**: Connect multiple S3-compatible providers
- **File management**: Create folders, upload files/folders, drag & drop
- **Sharing & links**: Generate shareable links, copy file/folder URLs
- **Offline support**: Service worker caches the app; syncs when online
- **Private locks**: Mark folders as privately locked
- **Bulk operations**: Select multiple items, move, delete
- **Search**: Find files and folders quickly
- **Chat integration**: AI-powered file summarization and chat (optional)
- **Admin dashboard**: Manage providers and view bucket contents

## Authentication

Uses `better-auth`. Configure via environment variables:

```
BETTER_AUTH_SECRET=<generated-secret>
```

See the [Better Auth docs](https://www.better-auth.com) for advanced setup.

## Database

Drizzle ORM with migrations. Schema files in `src/db/schema/`.

## Server Functions

Server-side logic lives in `createServerFn` handlers with Zod validation. Each page/module defines its own server functions.

## Client State & Caching

- **TanStack Query** for server state
- **Tanstack Store** for global UI state (e.g., upload progress)
- Optimistic updates and error handling built-in

## Development Hints

- Modals are lazy-loaded in the main storage page to reduce bundle size
- Context menus (right-click and three-dot) provide quick actions with icons
- Pagination uses infinite scroll with a 300px threshold

## Contribution

Run `pnpm lint`, `pnpm format`, and `pnpm check` before committing.
