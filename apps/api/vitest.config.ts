import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://user:pass@localhost:5432/targets_test",
      CORS_ORIGINS: "http://localhost:3000",
      APP_VERSION: "test",
    },
  },
});
