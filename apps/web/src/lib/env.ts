import { z } from "zod";

/** Server-only. Never import this from a "use client" component. */
const envSchema = z.object({
  API_URL: z.string().url().default("http://localhost:4000"),
});

export const env = envSchema.parse({
  API_URL: process.env.API_URL,
});
