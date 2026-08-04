import { buildApp } from "./app.js";
import { bootstrapAdmin } from "./lib/bootstrap.js";
import { env } from "./lib/env.js";
import { logger } from "./lib/logger.js";

async function main() {
  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
  } catch (err) {
    logger.error(err, "failed to start server");
    process.exit(1);
  }

  // Runs after the server is already accepting traffic (and passing
  // healthchecks) — a DB query plus an argon2id hash here was previously
  // blocking app.listen() long enough to blow past Railway's healthcheck
  // timeout and fail the deploy outright.
  bootstrapAdmin().catch((err) => {
    logger.warn(err, "bootstrap: could not ensure admin account (non-fatal)");
  });

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, async () => {
      logger.info({ signal }, "shutting down");
      await app.close();
      process.exit(0);
    });
  }
}

main();
