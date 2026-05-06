# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint (no separate type-check script — use tsc --noEmit)
```

No test suite is configured yet.

**Supabase local stack:**

```bash
supabase start   # Start local Supabase (Postgres on :54322, API on :54321, Studio on :54323)
supabase stop
supabase db reset          # Reset DB and re-run migrations + seed
supabase migration new <name>
supabase db diff --use-migra   # Diff local DB schema
```

## Architecture

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase

**Path alias:** `@/*` maps to `src/*`.

### Supabase clients

Two separate clients — always import the right one:

| File                         | Use when                                          |
| ---------------------------- | ------------------------------------------------- |
| `src/lib/supabase/client.ts` | Client Components (`'use client'`)                |
| `src/lib/supabase/server.ts` | Server Components, Route Handlers, Server Actions |

The server client wraps `cookies()` from `next/headers` (async in this Next.js version) and must be `await`-ed at call sites. The browser client uses `createBrowserClient` from `@supabase/ssr`.

### Environment variables

| Variable                               | Purpose                                                |
| -------------------------------------- | ------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase project URL                                   |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public (anon) key — note: **not** `ANON_KEY`           |
| `SUPABASE_SECRET_KEY`                  | Service-role key — server only, never expose to client |

`.env.local` is already configured for the local Supabase stack.

### Key Next.js 16 notes

This version has breaking changes from earlier releases. Before writing any routing, data-fetching, or rendering code, read the relevant guide in `node_modules/next/dist/docs/`. In particular:

- Slow client-side navigations: Suspense alone is insufficient — you must also export `unstable_instant` from the route (see `docs/01-app/02-guides/instant-navigation.mdx`).

**When starting work on a Next.js project, ALWAYS call the `init` tool from
next-devtools-mcp FIRST to set up proper context and establish documentation
requirements. Do this automatically without being asked.**
