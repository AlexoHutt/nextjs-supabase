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

### Routing & middleware

`src/proxy.ts` is the Next.js middleware (exported as `proxy` and consumed by `middleware.ts`). It:
- Redirects unauthenticated requests to `/login`
- Redirects authenticated users away from public paths to `/dashboard`
- Public paths: `/login`, `/signup`, `/auth/*` — everything else is protected

Auth callback for OAuth (Google) lives at `src/app/auth/callback/route.ts`, which exchanges the code for a session and redirects to `/dashboard`.

### Supabase clients

Two separate clients — always import the right one:

| File                         | Use when                                          |
| ---------------------------- | ------------------------------------------------- |
| `src/lib/supabase/client.ts` | Client Components (`'use client'`)                |
| `src/lib/supabase/server.ts` | Server Components, Route Handlers, Server Actions |

The server client wraps `cookies()` from `next/headers` (async in this Next.js version) and must be `await`-ed at call sites. The browser client uses `createBrowserClient` from `@supabase/ssr`.

### Server Actions pattern

Server Actions live in `src/app/actions/`. They follow the `useActionState` signature:

```ts
export async function actionName(
  _prevState: State,
  formData: FormData
): Promise<State>
```

Field-level validation uses Zod with `z.treeifyError()` to extract per-field error arrays. Forms are wired via `useActionState` in Client Components — the page/route itself is a Server Component that passes no form state down.

### Supabase Realtime

`src/app/chat/ChatRoom.tsx` uses `postgres_changes` to stream new messages. Three non-obvious requirements for this project's setup:

1. **Explicit JWT** — the `sb_publishable_*` key is not a JWT, so the Realtime WebSocket starts unauthenticated. Call `supabase.realtime.setAuth(session.access_token)` before subscribing, or RLS silently drops all events.
2. **Subscribe after auth** — call `getSession()` first, set auth, then create the channel inside the `.then()`. Subscribing before the promise resolves sends the join message without a JWT.
3. **Cancelled flag for StrictMode** — React StrictMode runs effects twice. Use a `cancelled` boolean in the effect so the first `.then()` bails out after cleanup, preventing a double-subscribe error.

The `messages` table is added to `supabase_realtime` publication in the migration.

### UI components

shadcn-style components live in `src/components/ui/`. Custom compound components (`Field`, `FieldGroup`, `FieldError`, `InputGroup`) wrap shadcn primitives to handle form field structure and validation display.

### Environment variables

| Variable                               | Purpose                                                |
| -------------------------------------- | ------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase project URL                                   |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public (anon) key — note: **not** `ANON_KEY`           |
| `SUPABASE_SECRET_KEY`                  | Service-role key — server only, never expose to client |
| `NEXT_PUBLIC_APP_URL`                  | Full origin (e.g. `http://localhost:3000`) — used as `redirectTo` for Google OAuth |

`.env.local` is already configured for the local Supabase stack.

### Key Next.js 16 notes

This version has breaking changes from earlier releases. Before writing any routing, data-fetching, or rendering code, read the relevant guide in `node_modules/next/dist/docs/`. In particular:

- Slow client-side navigations: Suspense alone is insufficient — you must also export `unstable_instant` from the route (see `docs/01-app/02-guides/instant-navigation.mdx`).

**When starting work on a Next.js project, ALWAYS call the `init` tool from
next-devtools-mcp FIRST to set up proper context and establish documentation
requirements. Do this automatically without being asked.**
