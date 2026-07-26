# Decisions (ADR log)

Short entries, newest first. Each records what was decided, why, and what it blocks.

## 2026-07-26 — Phase 0 scope and business-decision placeholders

**Context**: the build brief's Part 0 lists several business decisions (company
name/domain, service list, city coverage, rate card, bilingual, staff roles, driver
PWA) that gate later phases. None of these existed yet at the start of this session.

**Decided**:
- Company name, domain, phone, address: **placeholder** (`[COMPANY]`, `[DOMAIN]`,
  etc.) until supplied. Blocks: Phase 3 auth (cookie domain), any public marketing
  content with Organization/LocalBusiness schema.
- Service list: **placeholder starter set** for structural scaffolding only
  (Same Day, Rush, Overnight, Scheduled), marked `[[NEEDS: real service list]]`.
  Blocks: Phase 2 service route tree going live publicly.
- Service area: **real** — Kitchener, Waterloo, Cambridge (Waterloo Region). Chosen
  deliberately narrow per the brief's own doorway-page warning ("GTA" would have
  been too vague; three specific cities is exactly the brief's own example of
  correct scope).
- Pricing: **quote-on-request only** for v1. No rate card supplied, so the instant
  quote engine (originally Phase 4/6) is deferred until one exists.
- Localization: **English-only** at launch. No i18n routing scaffolded.
- Staff roles: use the brief's own enum (ADMIN, DISPATCHER, CSR, ACCOUNTING, DRIVER)
  — these came from the brief's Phase 3 schema spec, not invented.
- Driver PWA: **deferred**, not decided.
- Session scope: build **Phase 0 only** this session (monorepo skeleton that
  deploys), per the brief's own "one phase per session, stop at every phase gate"
  guidance, then stop for review before Phase 1.

**Why**: rule 4 in `CLAUDE.md` ("no mock data ... if a feature can't be finished,
stop and tell me") applies to business content, not to structural scaffolding —
Phase 0 has no business content to fake, so it could proceed immediately. Phase 2's
service×city pages explicitly cannot proceed past placeholder services without a
real list, or they'd violate the brief's own doorway-page quality gate.

## 2026-07-26 — Phase 0 implementation notes

- **pnpm 10 + `pnpm deploy`**: pnpm v10 changed the default deploy behavior for
  workspaces; `inject-workspace-packages=true` is required in `.npmrc` for
  `pnpm deploy --prod` to work with workspace dependencies (`@targets/shared`).
  Without it, `pnpm deploy` errors with `ERR_PNPM_DEPLOY_NONINJECTED_WORKSPACE`.
- **`packages/shared` ships compiled JS, not raw TS.** `apps/api` runs as plain
  Node in production (no ts-node/tsx), so `@targets/shared`'s `main`/`types`/
  `exports` point at `dist/index.js` (built via `tsc -p tsconfig.build.json`), not
  `src/index.ts`. Relative imports inside `packages/shared/src` use explicit `.js`
  extensions with `moduleResolution: NodeNext` so the compiled output is valid,
  runnable Node ESM. (Earlier attempt pointed `main` at `src/index.ts` directly;
  worked with Next's webpack bundler but broke `node dist/server.js` at runtime.)
- **`pnpm deploy` output needs its own `prisma generate`.** `pnpm deploy --prod`
  builds an isolated `node_modules` graph with a different pnpm-store hash than the
  monorepo's main install, so the Prisma client generated during the monorepo build
  doesn't carry over — importing `PrismaClient` in the deployed tree threw a
  Node ESM named-export resolution error until `prisma generate` was re-run inside
  `/prod/api` after `pnpm deploy`. `apps/api/Dockerfile` now does this explicitly.
  `prisma` was also moved from `devDependencies` to `dependencies` in
  `apps/api/package.json` so the CLI survives the `--prod` prune.
- **Turborepo dependency graph, not raw `pnpm --filter`, for the Docker build step.**
  `pnpm --filter @targets/api build` does not build `packages/shared` first;
  `pnpm exec turbo run build --filter=@targets/api` does, via `turbo.json`'s
  `"build": { "dependsOn": ["^build"] }`. The Dockerfile uses the turbo form.
- All of the above was verified locally end-to-end (not just "should work"): started
  a local Postgres 16 cluster, ran `prisma migrate dev`, ran `pnpm typecheck && pnpm
  lint && pnpm test && pnpm build`, ran the compiled API server standalone and via a
  simulated `pnpm deploy --prod` tree, and confirmed the web app's home page renders
  the API's live `/health` response server-side.
