import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { env } from "./lib/env.js";
import { logger } from "./lib/logger.js";
import { healthRoutes } from "./modules/health/route.js";
import { contactRoutes } from "./modules/contact/route.js";
import { authRoutes } from "./modules/auth/route.js";
import { portalRoutes } from "./modules/portal/route.js";
import { staffRoutes } from "./modules/staff/route.js";

export async function buildApp() {
  const app = Fastify({ loggerInstance: logger });

  await app.register(helmet);
  await app.register(cors, {
    origin: env.CORS_ORIGINS,
    credentials: true,
  });
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });
  await app.register(cookie);

  await app.register(healthRoutes);
  await app.register(contactRoutes);
  await app.register(authRoutes);
  await app.register(portalRoutes);
  await app.register(staffRoutes);

  return app;
}
