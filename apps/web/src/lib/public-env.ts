/**
 * Safe to import from client components: only NEXT_PUBLIC_* vars, inlined at
 * build time. No zod here on purpose — this file ships in the client bundle for
 * any route that needs it, and a schema library is overkill for one string.
 *
 * In production the browser hits /api/* on the same Vercel origin — a rewrite
 * in next.config.ts proxies those requests to the Railway API server-side, so
 * there are zero cross-origin issues (no CORS, no third-party cookies).
 */
export const publicEnv = {
  NEXT_PUBLIC_API_URL:
    process.env.NODE_ENV === "production"
      ? "/api"
      : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"),
};
