import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().url(),
  CORS_ORIGINS: z
    .string()
    .optional()
    .default("")
    .transform((value) => (value ? value.split(",").map((origin) => origin.trim()) : [])),
  APP_VERSION: z.string().default("0.0.0"),
  // Optional so the API keeps booting (health checks, everything else) before
  // this is configured on Railway. The contact route logs a clear warning and
  // still succeeds the DB write if it's unset — see lib/email.ts.
  RESEND_API_KEY: z.string().optional(),
  // Unset until a real domain is attached (see CLAUDE.md — auth cookies need
  // it). Leaving it unset makes cookies host-only, which is exactly right for
  // local dev but means cross-subdomain auth (www vs api) won't work in
  // production until this is set to ".yourdomain.com".
  COOKIE_DOMAIN: z.string().optional(),
  // Base URL of apps/web, used to build links in emails (password reset, etc).
  WEB_URL: z.string().url().default(
    process.env.NODE_ENV === "production"
      ? "https://targets-logistics-web.vercel.app"
      : "http://localhost:3000"
  ),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  // Railway injects RAILWAY_GIT_COMMIT_SHA automatically — read it directly
  // instead of requiring APP_VERSION to be manually wired to
  // ${{RAILWAY_GIT_COMMIT_SHA}} in the dashboard, which is easy to typo or
  // forget (this is exactly why /health's version was showing blank).
  const input = {
    ...process.env,
    APP_VERSION: process.env.APP_VERSION || process.env.RAILWAY_GIT_COMMIT_SHA,
  };
  const parsed = envSchema.safeParse(input);
  if (!parsed.success) {
    console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  return parsed.data;
}

export const env = loadEnv();
