# CLAUDE.md

## What this is
Production logistics platform for [COMPANY]. One repo, two deploy targets.
- `apps/web` — Next.js 15 App Router → Vercel. Marketing site + client portal + staff console.
- `apps/api` — Fastify + Prisma + PostgreSQL → Railway. All business logic, auth, data.

## Business decisions on record (see docs/DECISIONS.md for the full log)
- **Company name / domain / phone / address**: not yet supplied — `[COMPANY]` /
  `[DOMAIN]` are literal placeholders throughout this file and `docs/`. They must be
  real before Phase 3 (auth cookies are scoped to the real domain) and before any
  marketing content ships publicly (Organization/LocalBusiness schema needs them).
- **Services**: real tier list not yet supplied. Phase 1/2 scaffolding uses an
  explicitly placeholder starter set (Same Day, Rush, Overnight, Scheduled) marked
  `[[NEEDS: real service list]]` — replace before the marketing surface goes live.
- **Service area**: Kitchener, Waterloo, Cambridge (Waterloo Region). Real, not a
  placeholder — the Phase 2 locations tree is scoped to exactly these three cities.
  Do not add more cities without new content that meets the Phase 2 quality gate.
- **Pricing model (v1)**: quote-on-request only. No instant quote engine / rate card
  yet — that's deferred until a real rate card is supplied (see Phase 4/6 in the
  original brief).
- **Localization**: English-only at launch. No `/fr` routes.
- **Staff roles**: ADMIN, DISPATCHER, CSR, ACCOUNTING, DRIVER (per Phase 3 schema).
- **Driver PWA**: not yet decided — deferred until Phase 5/6 planning.

## Domains (non-negotiable, auth depends on it)
- Production web: `https://www.[DOMAIN]`
- Production API: `https://api.[DOMAIN]`
- Local: web `localhost:3000`, api `localhost:4000`

Both must sit on the same registrable domain in production so session cookies can be
scoped to `.[DOMAIN]` with `SameSite=Lax`. Never ship auth across `*.vercel.app` →
`*.railway.app` — that's a third-party cookie and browsers now drop it.

## Stack — do not substitute without asking
- pnpm workspaces + Turborepo
- Next.js 15 (App Router, RSC, Server Actions off — we call the API), TypeScript strict
- Tailwind CSS v4, no component library (build our own primitives)
- Fastify 5, Zod, Prisma, PostgreSQL 16
- Argon2id password hashing, opaque session tokens in Postgres (not stateless JWTs)
- Resend for transactional email, Vercel Blob for uploads, Pino for logs, Sentry both apps
- Vitest (api unit + integration), Playwright (web e2e)

## Rules
1. **Shared types live in `packages/shared`.** Zod schemas are the single source of truth;
   TS types are inferred from them. The API validates with them; the web imports them for forms.
   Never hand-write a duplicate interface.
2. **No new dependency without asking me first**, with a one-line justification. Prefer
   ~40 lines of our own code over a package.
3. **Targeted edits.** Never rewrite a file that only needs three lines changed. Never
   "refactor while you're in there."
4. **No mock data, no `TODO: implement`, no stubbed handlers in committed code.** If a
   feature can't be finished, stop and tell me instead of faking it. (Exception on
   record: Phase 1/2 placeholder service names, explicitly marked `[[NEEDS: ...]]` —
   structural scaffolding only, never presented as real content.)
5. **Every mutation route:** Zod-validated input → authz check → transaction →
   audit-log write → typed response. No exceptions, including for staff-only routes.
6. **Every list endpoint** is cursor-paginated and has an index behind its sort key.
7. Before you say a task is done, run `pnpm typecheck && pnpm lint && pnpm test` and paste
   the output. "Should work" is not done.
8. **Stop at every phase gate** and wait for my review. Do not start the next phase.
9. Money is `Int` cents, never `Float`. Timestamps are `timestamptz`, stored UTC,
   rendered in the account's timezone. Waybill numbers are opaque strings, never
   sequential integers exposed to clients.
10. Marketing routes must not make client-side data requests. If a marketing page needs
    data, fetch it server-side at build/revalidate time.

## Repo layout
```
apps/web/src/app/
  (marketing)/          # static or ISR, indexed
  (portal)/portal/      # client auth required, noindex
  (staff)/staff/        # staff auth required, noindex
  track/[waybill]/      # public, SSR, noindex on individual waybills
apps/api/src/
  modules/<domain>/     # route.ts, service.ts, repository.ts, schema.ts per domain
  lib/                  # db, auth, mailer, logger, errors
packages/shared/src/    # zod schemas, enums, constants, rate-engine types
```

## Commands
- `pnpm dev` — both apps
- `pnpm --filter api db:migrate` / `db:seed` / `db:studio`
- `pnpm test` / `pnpm test:e2e`

## Definition of done for any UI
Responsive to 360px. Visible keyboard focus. `prefers-reduced-motion` respected.
Real empty states and error states (never a blank div or a raw error string).
Loading states that don't shift layout.

## Phase status
- **Phase 0 (monorepo skeleton that deploys): done and confirmed live in
  production.** Both `apps/web` (Vercel) and `apps/api` (Railway + Postgres) are
  deployed, `/health` reports `db: "up"`, and the production Vercel page renders
  that payload fetched server-side from Railway. See `docs/DEPLOYMENT.md` for the
  click-path and `docs/DECISIONS.md` for open follow-ups (CORS origin should move
  to Vercel's stable alias once picked; no custom domain yet).
- Phase 1 onward: not started. Stop-and-review gate per the rule above.
