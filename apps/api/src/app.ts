import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { env } from "./lib/env.js";
import { logger } from "./lib/logger.js";
import { healthRoutes } from "./modules/health/route.js";
import { orderRoutes } from "./modules/order/route.js";
import { authRoutes } from "./modules/auth/route.js";
import { portalRoutes } from "./modules/portal/route.js";
import { staffRoutes } from "./modules/staff/route.js";
import { signupRoutes } from "./modules/signup/route.js";

export async function buildApp() {
  const app = Fastify({ loggerInstance: logger });

  await app.register(helmet);
  const corsOrigins = [...env.CORS_ORIGINS];
  try {
    const webOrigin = new URL(env.WEB_URL).origin;
    if (!corsOrigins.includes(webOrigin)) corsOrigins.push(webOrigin);
  } catch { /* WEB_URL not a valid URL — skip */ }
  // Always-allowed origins: local dev, the apex domain, and the Vercel alias
  // (kept so the site still works during DNS cutover). Browser calls go through
  // the same-origin proxy so this mainly covers any direct API access.
  for (const origin of [
    "http://localhost:3000",
    "https://target-logistics.ca",
    "https://www.target-logistics.ca",
    "https://targets-logistics-web.vercel.app",
  ]) {
    if (!corsOrigins.includes(origin)) corsOrigins.push(origin);
  }

  await app.register(cors, {
    origin: corsOrigins,
    credentials: true,
  });
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });
  await app.register(cookie);

  await app.register(healthRoutes);
  await app.register(orderRoutes);
  await app.register(authRoutes);
  await app.register(portalRoutes);
  await app.register(staffRoutes);
  await app.register(signupRoutes);

  return app;
}
