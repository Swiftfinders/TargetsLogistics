# API

`apps/api` — Fastify, Postgres via Prisma. All request/response shapes below
are the actual Zod schemas in `packages/shared/src` — the API validates
against them and the web app imports the same schemas for forms, so this
document can't drift from what the code actually accepts (see
`packages/shared/src/auth.ts`, `shipment-request.ts`, `contact.ts`).

## Auth model

Two separate cookie-based session systems — staff and client are structurally
incapable of authenticating against each other's routes (CLAUDE.md). Sessions
are opaque tokens (32 random bytes, base64url), hashed with SHA-256 before
storage; the raw token only ever exists in the cookie itself.

| Cookie | Set by | Required for |
|---|---|---|
| `tl_staff_session` | `POST /auth/staff/login` | any `/staff/*` route |
| `tl_client_session` | `POST /auth/client/login` | any `/portal/*` route |

Sessions: sliding 7-day expiry (refreshed once fewer than 6 days remain),
absolute 30-day cap from creation. 5 failed logins locks the account for 15
minutes. Every login failure (wrong password, unknown email, wrong user type,
locked account) returns the same `401 {"error":"invalid_credentials"}` —
never confirms which case it was, and a dummy password verify runs on the
"user not found" path so the response takes the same time either way.

## Public routes

### `GET /health`
Returns `{ status, version, db, timestamp }`. `db` degrades to `"down"`
instead of the route failing outright — see `apps/api/src/modules/health`.

### `POST /contact`
Public marketing lead form. Body: `contactSubmissionInputSchema` (name,
email, phone?, company?, message). `201` with `{ id, receivedAt }`. Persists
to Postgres and best-effort emails a notification — a failed email never
fails the request (the DB write already succeeded).

### `POST /signup`
Public self-serve request for portal access. Body: `signupRequestInputSchema`
(`name`, `email`, `company`). Creates an `Account` and a `CLIENT` user with
`status: PENDING` in one transaction — the account can't log in until staff
approves it (see `POST /staff/signups/:id/approve` below). `201 {"ok":true}`.
`409` if the email is already registered. Rate-limited to 10 attempts / 15
minutes per IP.

## Auth routes

### `POST /auth/staff/login` / `POST /auth/client/login`
Body: `loginInputSchema` (`email`, `password`). `200` with `{ user }` and
sets the matching session cookie. `401` on any failure. Rate-limited to 10
attempts / 15 minutes per IP.

### `POST /auth/staff/logout` / `POST /auth/client/logout`
Revokes the current session (if any) and clears the cookie. Always `204`.

### `GET /auth/staff/me` / `GET /auth/client/me`
Requires the matching session cookie. `200` with `{ user }`, `401` if not
authenticated.

### `POST /auth/password/forgot`
Body: `forgotPasswordInputSchema` (`email`). Always `200 {"ok":true}`
regardless of whether the email exists — existence is never confirmed. If it
does, emails a single-use, 30-minute reset link.

### `POST /auth/password/reset`
Body: `resetPasswordInputSchema` (`token`, `password`). Consumes the token,
sets the new password, and revokes every other session for that user. `400`
if the token is invalid, expired, or already used.

## Client portal (`requireClient`, scoped to the caller's account)

### `GET /portal/requests`
Cursor-paginated (`?cursor=<id>&limit=<n>`, default 20, max 100) list of the
caller's *own account's* shipment requests, newest first. `{ items, nextCursor }`.

### `POST /portal/requests`
Body: `createShipmentRequestInputSchema` (pickupAddress, dropoffAddress,
description, neededBy, serviceTier, pieces?, weightKg?). `201` with the
created record.

### `GET /portal/requests/:id`
`200` with the record if it belongs to the caller's account, otherwise `404`
— never `403`, so a client can't distinguish "not yours" from "doesn't
exist."

## Staff console (`requireStaff`, sees every account)

### `GET /staff/requests`
Cursor-paginated list across *all* accounts, newest first. Optional
`?status=NEW|ACKNOWLEDGED|CLOSED` filter. Includes the owning account's name.

### `GET /staff/requests/:id`
`200` with the record (any account) or `404`.

### `PATCH /staff/requests/:id/status`
Body: `updateShipmentRequestStatusInputSchema` (`status`). Writes an
`audit_log` entry (before/after status, actor, IP) in the same transaction as
the update.

### `POST /staff/clients`
Body: `createClientInputSchema` (accountName, userName, email). Creates a new
`Account` and its first `CLIENT` user in one transaction, writes an audit log
entry, and emails an invite link (same single-use/30-minute mechanism as
password reset) — the user has no usable password until they follow it.
`409` if the email is already registered.

### `GET /staff/signups`
Cursor-paginated list of `CLIENT` users with `status: PENDING` (self-serve
signups awaiting review), newest first. `{ items, nextCursor }`.

### `POST /staff/signups/:id/approve`
Sets the user's status to `INVITED`, writes an audit log entry, and emails
the same invite/set-password link as `POST /staff/clients`. `404` if the
user doesn't exist or isn't `PENDING`.

### `POST /staff/signups/:id/reject`
Sets the user's status to `SUSPENDED` (keeps the record for reference rather
than deleting it) and writes an audit log entry. `404` if the user doesn't
exist or isn't `PENDING`.

## What's deliberately not here yet

No order/waybill/tracking model, no rate cards, no invoicing, no drivers —
this phase is scoped to staff login + a structured client request portal, not
full shipment lifecycle tracking. See `docs/DECISIONS.md`.
