# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Commonly used commands for development:

- `pnpm dev`: Start the development server.
- `pnpm build`: Build the project for production.
- `pnpm test`: Run tests with Vitest.
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
- **State Management**: TanStack Query for server state and TanStack Store for global UI state.
- **Authentication**: `better-auth`.

Key Directories:
- `src/routes/`: TanStack Router file-based route definitions.
- `src/components/`: UI components.
- `src/lib/`: Shared utilities, data fetching queries, mutations, and stores.
- `src/db/`: Drizzle ORM schema and migrations.
