# Deployment

Two deploy targets from one repo: `apps/web` → Vercel, `apps/api` → Railway. Both
must end up on the same registrable domain in production (`www.[DOMAIN]` and
`api.[DOMAIN]`) so session cookies can be scoped to `.[DOMAIN]`. Until a real domain
is attached, auth (Phase 3+) cannot ship to production — see `CLAUDE.md`.

## Vercel (apps/web)

1. **New Project** → import this repository.
2. **Root Directory**: `apps/web`.
3. **Framework Preset**: Next.js (auto-detected).
4. Under **Build & Development Settings**, toggle **"Include files outside of the
   Root Directory in the Build Step"** to **ON**. Without this, `packages/shared`
   won't resolve during the Vercel build (it lives outside `apps/web`).
5. **Install Command**: `pnpm install --frozen-lockfile` (run from repo root — Vercel
   does this automatically once Root Directory + "include outside root" are set).
6. **Build Command**: `pnpm turbo run build --filter=@targets/web` (leave default
   `next build` only if you disable the outside-root option above; prefer the turbo
   filter so `packages/shared` builds first).
7. **Output Directory**: leave default (`.next`).
8. **Environment Variables** (Project Settings → Environment Variables):
   - `API_URL` — `https://api.[DOMAIN]` in Production/Preview, `http://localhost:4000`
     in Development.
9. **Ignored Build Step** (Project Settings → Git): set the command to
   `npx turbo-ignore` so commits that only touch `apps/api/**` skip the web build.
10. Attach the custom domain `www.[DOMAIN]` (Project Settings → Domains) once you
    own the domain.

## Railway (apps/api)

1. **New Project** → **Deploy from GitHub repo** → select this repository.
2. Railway will read `railway.toml` at the repo root automatically:
   - `builder = "DOCKERFILE"`, `dockerfilePath = "apps/api/Dockerfile"` — Railway
     builds `apps/api/Dockerfile` with the **repo root** as build context (required,
     since the Dockerfile's `pnpm fetch`/`pnpm install` steps need the whole
     workspace: lockfile, `packages/shared`, `packages/config`).
   - `watchPatterns` limits redeploys to `apps/api/**`, `packages/shared/**`,
     `packages/config/**`, and the lockfile — a web-only commit will not trigger an
     API redeploy.
   - `releaseCommand` runs `prisma migrate deploy` **after** each successful build,
     before the new instance takes traffic — never in the build step, since Railway
     builds can run more than once and concurrently, and a build-step migration can
     race across instances.
3. **Add a PostgreSQL plugin** to the project (Railway → New → Database →
   PostgreSQL). Railway injects `DATABASE_URL` into the service automatically when
   the plugin and the service share a project — reference it as
   `${{Postgres.DATABASE_URL}}` in the service's variables, or copy the value.
4. **Environment Variables** (Service → Variables):
   - `DATABASE_URL` — from the Postgres plugin (see above).
   - `CORS_ORIGINS` — `https://www.[DOMAIN]` (comma-separate if you also need a
     staging origin).
   - `APP_VERSION` — set to `${{RAILWAY_GIT_COMMIT_SHA}}` so `/health` reports the
     deployed commit.
   - `PORT` — Railway sets this automatically; do not override it.
5. **Custom domain**: Service Settings → Networking → Custom Domain →
   `api.[DOMAIN]`. Add the CNAME Railway gives you at your DNS provider.
6. **Healthcheck**: already configured via `railway.toml`
   (`healthcheckPath = "/health"`) — Railway will not cut traffic over to a new
   deploy until `/health` returns 200.

## CORS + cookie-domain configuration (must match between the two)

- `apps/api`'s `CORS_ORIGINS` env var must list the exact Vercel production origin
  (`https://www.[DOMAIN]`) — a wildcard origin silently disables `credentials: true`
  cookie auth (Phase 3+).
- Once auth ships, session cookies are scoped to `.[DOMAIN]` — this requires `www`
  (Vercel) and `api` (Railway) to be subdomains of the *same* registrable domain.
  Do not ship auth against `*.vercel.app` and `*.railway.app` preview URLs; browsers
  treat that pairing as third-party and will drop the cookie.
- `apps/web`'s `API_URL` env var must point at the Railway custom domain
  (`https://api.[DOMAIN]`), not the `*.up.railway.app` URL, once the custom domain is
  attached — the internal Railway URL only helps service-to-service traffic within
  Railway, and the Vercel frontend is not on Railway's network.

## Running database migrations

- **Local**: `pnpm --filter api db:migrate` (interactive `prisma migrate dev`).
- **Production**: automatic via `railway.toml`'s `releaseCommand`
  (`prisma migrate deploy`) on every deploy. Never run `migrate dev` against
  production data.

## CI (GitHub Actions)

`.github/workflows/ci.yml` runs on every PR and on pushes to `main`: install, spin up
a throwaway Postgres 16 service container, apply migrations, `typecheck`, `lint`,
`test`, `build` — across every workspace package via Turborepo. A red check on a PR
means one of those failed; the job log shows which package and command.

## Verifying a deploy

1. `curl https://api.[DOMAIN]/health` → expect
   `{"status":"ok","version":"<sha>","db":"up","timestamp":"..."}`.
2. `curl https://api.[DOMAIN]/ready` → expect `{"ready":true}`.
3. Visit `https://www.[DOMAIN]` — the Phase 0 landing page renders the same health
   payload fetched server-side, proving the two services can reach each other in
   production. (This page is replaced by real marketing content in Phase 1/2.)
