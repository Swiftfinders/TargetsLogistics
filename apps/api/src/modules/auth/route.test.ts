import { afterEach, describe, expect, it } from "vitest";
import argon2 from "argon2";
import { buildApp } from "../../app.js";
import { prisma } from "../../lib/db.js";

const PASSWORD = "correct-horse-battery-staple";
const createdUserIds: string[] = [];

async function createUser(overrides: Partial<{ email: string; userType: "STAFF" | "CLIENT"; accountId: string }> = {}) {
  const passwordHash = await argon2.hash(PASSWORD, { type: argon2.argon2id });
  const user = await prisma.user.create({
    data: {
      email: overrides.email ?? `test-${crypto.randomUUID()}@example.com`,
      name: "Test User",
      passwordHash,
      userType: overrides.userType ?? "STAFF",
      status: "ACTIVE",
      accountId: overrides.accountId ?? null,
    },
  });
  createdUserIds.push(user.id);
  return user;
}

afterEach(async () => {
  if (createdUserIds.length === 0) return;
  await prisma.session.deleteMany({ where: { userId: { in: createdUserIds } } });
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  createdUserIds.length = 0;
});

describe("POST /auth/staff/login", () => {
  it("rejects a wrong password with a generic error", async () => {
    const app = await buildApp();
    const user = await createUser({ userType: "STAFF" });

    const response = await app.inject({
      method: "POST",
      url: "/auth/staff/login",
      payload: { email: user.email, password: "wrong-password" },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: "invalid_credentials" });
    await app.close();
  });

  it("rejects a client credential on the staff login endpoint", async () => {
    const app = await buildApp();
    const account = await prisma.account.create({ data: { name: "Isolation Test Co" } });
    const user = await createUser({ userType: "CLIENT", accountId: account.id });

    const response = await app.inject({
      method: "POST",
      url: "/auth/staff/login",
      payload: { email: user.email, password: PASSWORD },
    });

    expect(response.statusCode).toBe(401);
    await prisma.account.delete({ where: { id: account.id } });
    await app.close();
  });

  it("logs in with correct credentials and sets a session cookie", async () => {
    const app = await buildApp();
    const user = await createUser({ userType: "STAFF" });

    const response = await app.inject({
      method: "POST",
      url: "/auth/staff/login",
      payload: { email: user.email, password: PASSWORD },
    });

    expect(response.statusCode).toBe(200);
    const cookie = response.cookies.find((c) => c.name === "tl_staff_session");
    expect(cookie).toBeDefined();

    const meResponse = await app.inject({
      method: "GET",
      url: "/auth/staff/me",
      cookies: { tl_staff_session: cookie!.value },
    });
    expect(meResponse.statusCode).toBe(200);
    expect(meResponse.json().user.email).toBe(user.email);

    await app.close();
  });

  it("locks the account after repeated failed attempts", async () => {
    const app = await buildApp();
    const user = await createUser({ userType: "STAFF" });

    for (let i = 0; i < 5; i += 1) {
      await app.inject({ method: "POST", url: "/auth/staff/login", payload: { email: user.email, password: "wrong" } });
    }

    const response = await app.inject({
      method: "POST",
      url: "/auth/staff/login",
      payload: { email: user.email, password: PASSWORD },
    });

    expect(response.statusCode).toBe(401);
    const updated = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(updated.lockedUntil).not.toBeNull();

    await app.close();
  });
});

describe("GET /auth/staff/me", () => {
  it("rejects a request with no session cookie", async () => {
    const app = await buildApp();
    const response = await app.inject({ method: "GET", url: "/auth/staff/me" });
    expect(response.statusCode).toBe(401);
    await app.close();
  });
});
