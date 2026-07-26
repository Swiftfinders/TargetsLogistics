import { describe, expect, it } from "vitest";
import { buildApp } from "../../app.js";
import { prisma } from "../../lib/db.js";

describe("POST /contact", () => {
  it("rejects a submission missing required fields", async () => {
    const app = await buildApp();
    const response = await app.inject({ method: "POST", url: "/contact", payload: { name: "Jordan" } });

    expect(response.statusCode).toBe(400);
    await app.close();
  });

  it("persists a valid submission and returns its id", async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/contact",
      payload: {
        name: "Jordan Reyes",
        email: "jordan@example.com",
        message: "Need a same-day pickup quote for a Kitchener to Cambridge run.",
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.id).toBeTypeOf("string");

    const stored = await prisma.contactSubmission.findUnique({ where: { id: body.id } });
    expect(stored?.email).toBe("jordan@example.com");

    await prisma.contactSubmission.delete({ where: { id: body.id } });
    await app.close();
  });
});
