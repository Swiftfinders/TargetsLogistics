import { describe, expect, it } from "vitest";
import { buildApp } from "../../app.js";

describe("GET /health", () => {
  it("returns a well-formed health payload", async () => {
    const app = await buildApp();
    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toMatchObject({ status: expect.stringMatching(/ok|degraded/) });
    expect(body.version).toBeTypeOf("string");
    expect(body.timestamp).toBeTypeOf("string");

    await app.close();
  });
});
