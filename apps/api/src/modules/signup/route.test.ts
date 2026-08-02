import { afterEach, describe, expect, it } from "vitest";
import argon2 from "argon2";
import { buildApp } from "../../app.js";
import { prisma } from "../../lib/db.js";

const PASSWORD = "correct-horse-battery-staple";
const cleanupAccountIds: string[] = [];
const cleanupUserIds: string[] = [];

async function createStaff() {
  const passwordHash = await argon2.hash(PASSWORD, { type: argon2.argon2id });
  const user = await prisma.user.create({
    data: {
      email: `staff-${crypto.randomUUID()}@example.com`,
      name: "Test Staff",
      passwordHash,
      userType: "STAFF",
      status: "ACTIVE",
    },
  });
  cleanupUserIds.push(user.id);
  return user;
}

async function loginAsStaff(app: Awaited<ReturnType<typeof buildApp>>, email: string) {
  const response = await app.inject({ method: "POST", url: "/auth/staff/login", payload: { email, password: PASSWORD } });
  return response.cookies.find((c) => c.name === "tl_staff_session")!.value;
}

afterEach(async () => {
  if (cleanupUserIds.length > 0) {
    await prisma.session.deleteMany({ where: { userId: { in: cleanupUserIds } } });
    await prisma.passwordResetToken.deleteMany({ where: { userId: { in: cleanupUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: cleanupUserIds } } });
  }
  if (cleanupAccountIds.length > 0) {
    await prisma.account.deleteMany({ where: { id: { in: cleanupAccountIds } } });
  }
  cleanupUserIds.length = 0;
  cleanupAccountIds.length = 0;
});

describe("public signup", () => {
  it("creates a pending account and user", async () => {
    const app = await buildApp();
    const email = `signup-${crypto.randomUUID()}@example.com`;

    const response = await app.inject({
      method: "POST",
      url: "/signup",
      payload: { name: "Jamie Smith", email, company: "Signup Test Co" },
    });
    expect(response.statusCode).toBe(201);

    const user = await prisma.user.findUnique({ where: { email } });
    expect(user).not.toBeNull();
    expect(user!.status).toBe("PENDING");
    if (user) {
      cleanupUserIds.push(user.id);
      if (user.accountId) cleanupAccountIds.push(user.accountId);
    }

    await app.close();
  });

  it("rejects a duplicate email with 409", async () => {
    const app = await buildApp();
    const email = `signup-${crypto.randomUUID()}@example.com`;

    const first = await app.inject({
      method: "POST",
      url: "/signup",
      payload: { name: "Jamie Smith", email, company: "Signup Test Co" },
    });
    expect(first.statusCode).toBe(201);
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      cleanupUserIds.push(user.id);
      if (user.accountId) cleanupAccountIds.push(user.accountId);
    }

    const second = await app.inject({
      method: "POST",
      url: "/signup",
      payload: { name: "Jamie Smith", email, company: "Signup Test Co" },
    });
    expect(second.statusCode).toBe(409);

    await app.close();
  });

  it("cannot log in while pending", async () => {
    const app = await buildApp();
    const email = `signup-${crypto.randomUUID()}@example.com`;

    await app.inject({ method: "POST", url: "/signup", payload: { name: "Jamie Smith", email, company: "Signup Test Co" } });
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      cleanupUserIds.push(user.id);
      if (user.accountId) cleanupAccountIds.push(user.accountId);
    }

    const loginResponse = await app.inject({
      method: "POST",
      url: "/auth/client/login",
      payload: { email, password: "pending-signup-must-be-approved-and-set-password" },
    });
    expect(loginResponse.statusCode).toBe(401);

    await app.close();
  });
});

describe("staff signup review", () => {
  it("lists pending signups and approves one", async () => {
    const app = await buildApp();
    const staff = await createStaff();
    const staffCookie = await loginAsStaff(app, staff.email);
    const email = `signup-${crypto.randomUUID()}@example.com`;

    await app.inject({ method: "POST", url: "/signup", payload: { name: "Jamie Smith", email, company: "Signup Test Co" } });
    const pendingUser = await prisma.user.findUniqueOrThrow({ where: { email } });
    cleanupUserIds.push(pendingUser.id);
    if (pendingUser.accountId) cleanupAccountIds.push(pendingUser.accountId);

    const listResponse = await app.inject({
      method: "GET",
      url: "/staff/signups",
      cookies: { tl_staff_session: staffCookie },
    });
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().items.some((item: { id: string }) => item.id === pendingUser.id)).toBe(true);

    const approveResponse = await app.inject({
      method: "POST",
      url: `/staff/signups/${pendingUser.id}/approve`,
      cookies: { tl_staff_session: staffCookie },
    });
    expect(approveResponse.statusCode).toBe(200);

    const updated = await prisma.user.findUniqueOrThrow({ where: { id: pendingUser.id } });
    expect(updated.status).toBe("INVITED");

    const token = await prisma.passwordResetToken.findFirst({ where: { userId: pendingUser.id } });
    expect(token).not.toBeNull();

    await app.close();
  });

  it("rejects a pending signup by suspending it", async () => {
    const app = await buildApp();
    const staff = await createStaff();
    const staffCookie = await loginAsStaff(app, staff.email);
    const email = `signup-${crypto.randomUUID()}@example.com`;

    await app.inject({ method: "POST", url: "/signup", payload: { name: "Jamie Smith", email, company: "Signup Test Co" } });
    const pendingUser = await prisma.user.findUniqueOrThrow({ where: { email } });
    cleanupUserIds.push(pendingUser.id);
    if (pendingUser.accountId) cleanupAccountIds.push(pendingUser.accountId);

    const rejectResponse = await app.inject({
      method: "POST",
      url: `/staff/signups/${pendingUser.id}/reject`,
      cookies: { tl_staff_session: staffCookie },
    });
    expect(rejectResponse.statusCode).toBe(200);

    const updated = await prisma.user.findUniqueOrThrow({ where: { id: pendingUser.id } });
    expect(updated.status).toBe("SUSPENDED");

    await app.close();
  });

  it("rejects an unauthenticated request to list signups", async () => {
    const app = await buildApp();
    const response = await app.inject({ method: "GET", url: "/staff/signups" });
    expect(response.statusCode).toBe(401);
    await app.close();
  });
});
