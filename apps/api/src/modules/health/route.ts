import type { FastifyInstance } from "fastify";
import { healthResponseSchema } from "@targets/shared";
import { prisma } from "../../lib/db.js";
import { env } from "../../lib/env.js";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => {
    let db: "up" | "down" = "up";
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      db = "down";
    }

    const body = healthResponseSchema.parse({
      status: db === "up" ? "ok" : "degraded",
      version: env.APP_VERSION,
      db,
      timestamp: new Date().toISOString(),
    });

    return body;
  });

  app.get("/ready", async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { ready: true };
    } catch {
      return reply.code(503).send({ ready: false });
    }
  });
}
