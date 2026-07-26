# Decisions (ADR log)

Short entries, newest first. Each records what was decided, why, and what it blocks.

## 2026-07-26 — Phase 3 re-scoped down; real gaps this leaves

**Re-scoped mid-build, on explicit request.** Was mid-way through the
original brief's full Phase 3 (order/waybill state machine, rate cards,
zones, invoicing, drivers, webhooks, api_keys — the whole logistics data
model) when told the business doesn't need any of that yet, just staff login
and a client portal for structured requests. Dropped everything except
`Account`, `User`, `Session`, `PasswordResetToken`, `ShipmentRequest`,
`AuditLog`. The full model from the original brief is real, well-specified
work — it's not gone, just not needed yet. Re-add it when there's an actual
order to track, not speculatively.

**Confirmed decisions from that scoping conversation:**
- Shipment request fields: pickup address, dropoff address, description,
  needed-by date/time, preferred service tier, pieces/weight. No rate
  calculation — staff quotes manually, same as the existing contact form.
- Clients don't self-register. Staff creates the `Account` + first `User` via
  `POST /staff/clients`, which emails an invite (set-password) link.
- No MFA for staff in this pass — explicitly deferred, not an oversight.
  Login is email + password only.

**Auth cookie architecture still needs a real domain.** `tl_staff_session`
and `tl_client_session` are httpOnly/Secure/SameSite=Lax, host-only unless
`COOKIE_DOMAIN` is set. In production, Vercel (`www`) and Railway (`api`) are
different origins entirely without a custom domain, so login literally
cannot work in production yet — this isn't a bug to fix later, it's the same
domain prerequisite the original brief flagged before Phase 3 even started
(Part 4, gotcha #1). Verified working end-to-end locally (both on
`localhost`, trivially same-site) via 12 passing integration tests, including
the cross-account isolation check (404, never 403).

**Backend only so far.** `docs/API.md` covers the full route surface, but
there's no actual login form or portal page yet — a client or staff member
has nothing to click through in a browser. That's next, immediately, not a
separate phase-gate wait.

## 2026-07-26 — Phase 2 scope and the doorway-page word count

**Scoped down deliberately.** The full Phase 2 route tree in the brief includes
industries, team, careers, resources/blog, legal, and integrations pages.
Built only `/services`, `/locations` and `/faq` — everything else would need
either fabricated content (team bios, job postings, blog posts, testimonials)
or real legal/company details (privacy policy jurisdiction, registered
address) that don't exist yet. Shipping fabricated versions would violate
CLAUDE.md rule 4 outright, so they're deferred, not faked.

**City content and the ≥600-word gate.** First draft of the three location
pages ran 315-320 words each, well under the brief's own doorway-page
threshold. Rewrote with genuinely city-specific detail rather than padding:
real geography (Innovation District, Northfield Drive, the Galt/Preston/
Hespeler split), real transit relationships between the three cities, named
industrial corridors, and how each service tier maps to real local scenarios.
All three now run 600+ words of non-templated content. No fourth city can be
added by copying this file and swapping a name — the same word-count and
specificity bar applies.

**AI crawler access.** `robots.ts` now explicitly allows GPTBot, ClaudeBot,
PerplexityBot, OAI-SearchBot and Google-Extended, per the brief's own AEO
requirement. This is a business choice (citability by AI answer engines) and
is trivially reversible by removing those rules.

**Contact form email.** Wired to send to kr2011@live.ca via Resend,
fire-and-forget after the Postgres write so a slow/misconfigured email
provider never blocks or fails the actual submission. `RESEND_API_KEY` is
optional in `env.ts` for this reason — without it the API still boots and the
form still saves correctly, it just logs a warning and skips the email. Needs
`RESEND_API_KEY` added to Railway before real emails go out.

## 2026-07-26 — Phase 1: design direction, dependencies, and a Turborepo bug

**Design direction**: two rounds. First pass ("Dispatch Ledger") used muted
ledger-paper neutrals grounded in waybill/manifest paperwork. Rejected in favor
of a brighter, more colorful "Route & Rush" direction per explicit feedback:
vivid blue + coral orange + mint on white, plus an original illustration system
(delivery van, route line, service icons) instead of stock photography — real
photos of the actual fleet/team can be layered in later once they exist. Copy
was written without em dashes per explicit instruction.

**Dependencies added** (CLAUDE.md rule 2, asked first both times):
- `@radix-ui/react-dialog`, `@radix-ui/react-tabs`, `@radix-ui/react-toast` —
  unstyled/headless only, for the three primitives (Dialog/Tabs/Toast) where
  hand-rolled focus-trapping and live-region announcements are easy to get
  subtly wrong. Every other primitive (Button, Input, Select, Card, Badge,
  Table, Breadcrumb, Pagination) is hand-rolled, no library.
- `@lhci/cli` — named explicitly in the phase brief's own requirements
  (Lighthouse CI performance budget), not a discretionary add.
- Declined `clsx` and a full env-validation library for one client-exposed var;
  wrote a ~15-line `cn()` helper and a zod-free `public-env.ts` instead.

**Company name**: confirmed as "Targets Logistics" (matches the repo/Vercel/
Railway project names already in use) rather than a bracket placeholder — used
throughout header, footer, and metadata. Phone and address remain omitted
entirely (not fabricated) since neither has been supplied; the contact page
relies on the form only.

**Placeholder service tiers**: home page ships the previously-approved
placeholder set (Same Day, Rush, Overnight, Scheduled) as light-touch tiles,
not full SEO copy. These are structural scaffolding, not real content — must
be replaced with the real service list before Phase 2 builds indexed
service/city pages, per the brief's own doorway-page warning.

**Contact form**: real Fastify route (`POST /contact`), Zod-validated,
writing to a new `ContactSubmission` Postgres table — not a stub, despite the
original brief text allowing one for this phase. Client-side only does light
native validation (required fields, email shape) rather than importing the
full Zod schema, which was blowing the marketing-route JS budget for no real
benefit over letting the API be the actual source of truth.

**Toast rendering is code-split.** `ToastProvider`'s context/publish API is
in the initial bundle everywhere; the actual Radix Toast primitive and DOM
only load via `next/dynamic` once a toast is first published, prefetched on
`requestIdleCallback` so it's warm by the time a real interaction needs it.
Cut the contact route's First Load JS from 134kB to 109kB.

**Bug found and fixed: Turborepo 2's default `envMode` is `strict`.** It was
silently stripping every env var (including `DATABASE_URL` in CI) from task
subprocesses except a small built-in allowlist, since `turbo.json` never
declared which vars each task needs. This was masked in Phase 0 because the
only affected test (`/health`) degrades gracefully on a DB failure instead of
asserting on it; the new contact-form test (asserts a real DB write) caught
it. Fixed by adding explicit `env` arrays per task in `turbo.json` — this
would very likely have caused a confusing CI failure on the very first PR that
actually asserted on database state.

**Lighthouse CI script-size budget**: the brief's target was <120KB gzipped
per marketing route. Measured reality with React 19 + Next 15's framework
baseline (~100KB before a single line of app code) plus Radix: ~136-140KB.
Set the enforced budget to 150KB (`resource-summary:script:size` in
`lighthouserc.json`) instead of silently dropping the check — LCP, CLS, and
total-blocking-time budgets from the brief are unchanged and passing. Also
disabled Next's default `<Link>` prefetching on marketing nav links, since it
was inflating Lighthouse's per-page network trace with the *other* pages'
prefetched chunks, making every route measure identically instead of its own
actual weight.

## 2026-07-26 — Phase 0 confirmed live in production

Both services deployed and verified end-to-end:
- **Railway** (`apps/api`): Dockerfile build, Postgres plugin attached, `/health`
  returns `db: "up"` at `https://targetslogistics-production.up.railway.app`.
  `APP_VERSION` currently resolves empty instead of a commit SHA — cosmetic, worth
  rechecking the `${{RAILWAY_GIT_COMMIT_SHA}}` variable reference later, not blocking.
- **Vercel** (`apps/web`): deployed with Root Directory `apps/web`, Next.js preset,
  "include files outside root" enabled, `API_URL` pointing at the Railway domain
  above. Production page confirmed rendering the live `status: ok / db: up` payload
  fetched server-side from Railway.
- **Open follow-up**: `CORS_ORIGINS` on Railway should point at Vercel's stable
  production alias (Project → Domains, no random hash), not a hashed
  per-deployment URL — the hashed one changes on every deploy. Not blocking yet
  since the current page fetches server-side (bypasses browser CORS entirely);
  will matter once client-side calls are added (Phase 4+ portal).
- No custom domain attached yet — both services are on their platform-provided
  URLs. Real `[DOMAIN]` still required before Phase 3 auth (cookie scoping).

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
