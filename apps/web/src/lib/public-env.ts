/**
 * Safe to import from client components: only NEXT_PUBLIC_* vars, inlined at
 * build time. No zod here on purpose — this file ships in the client bundle for
 * any route that needs it, and a schema library is overkill for one string.
 */
export const publicEnv = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
};
