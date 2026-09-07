import { afterEach, describe, expect, it } from "vitest";
import argon2 from "argon2";
import { buildApp } from "../../app.js";
import { prisma } from "../../lib/db.js";

const PASSWORD = "correct-horse-battery-staple";
const cleanupAccountIds: string[] = [];
const cleanupUserIds: string[] = [];

const validOrder = {
  pickupAddress: "1 Main St, Kitchener, ON",
  deliveryAddress: "2 King St, Waterloo, ON",
  serviceLevel: "SAME_DAY",
  vehicleType: "CAR",
};

async function createClient(accountName: string) {
  const account = await prisma.account.create({ data: { name: accountName } });
  const passwordHash = await argon2.hash(PASSWORD, { type: argon2.argon2id });
  const user = await prisma.user.create({
    data: {
      email: `test-${crypto.randomUUID()}@example.com`,
      name: "Test Client",
      passwordHash,
      userType: "CLIENT",
      status: "ACTIVE",
      accountId: account.id,
    },
  });
  cleanupAccountIds.push(account.id);
  cleanupUserIds.push(user.id);
  return { account, user };
}

async function loginAs(app: Awaited<ReturnType<typeof buildApp>>, email: string) {
  const response = await app.inject({ method: "POST", url: "/auth/client/login", payload: { email, password: PASSWORD } });
  const cookie = response.cookies.find((c) => c.name === "tl_client_session");
  return cookie!.value;
}

afterEach(async () => {
  if (cleanupUserIds.length > 0) {
    await prisma.session.deleteMany({ where: { userId: { in: cleanupUserIds } } });
    await prisma.order.deleteMany({ where: { createdByUserId: { in: cleanupUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: cleanupUserIds } } });
  }
  if (cleanupAccountIds.length > 0) {
    await prisma.order.deleteMany({ where: { accountId: { in: cleanupAccountIds } } });
    await prisma.account.deleteMany({ where: { id: { in: cleanupAccountIds } } });
  }
  cleanupUserIds.length = 0;
  cleanupAccountIds.length = 0;
});

describe("client portal orders", () => {
  it("lets a client create and read back their own order with a priced estimate", async () => {
    const app = await buildApp();
    const { user } = await createClient("Portal Test Co A");
    const sessionCookie = await loginAs(app, user.email);

    const createResponse = await app.inject({
      method: "POST",
      url: "/portal/orders",
      cookies: { tl_client_session: sessionCookie },
      payload: validOrder,
    });
    expect(createResponse.statusCode).toBe(201);
    // Car base rate is $25.00 → 2500 cents.
    expect(createResponse.json().estimatedPriceCents).toBe(2500);
    expect(createResponse.json().reference).toMatch(/^TL-\d{6}-\d{3}$/);

    const listResponse = await app.inject({
      method: "GET",
      url: "/portal/orders",
      cookies: { tl_client_session: sessionCookie },
    });
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().items).toHaveLength(1);

    await app.close();
  });

  it("returns 404, not 403, when a client requests another account's order", async () => {
    const app = await buildApp();
    const clientA = await createClient("Portal Test Co A");
    const clientB = await createClient("Portal Test Co B");

    const sessionA = await loginAs(app, clientA.user.email);
    const sessionB = await loginAs(app, clientB.user.email);

    const createResponse = await app.inject({
      method: "POST",
      url: "/portal/orders",
      cookies: { tl_client_session: sessionA },
      payload: validOrder,
    });
    const orderId = createResponse.json().id;

    const crossAccountResponse = await app.inject({
      method: "GET",
      url: `/portal/orders/${orderId}`,
      cookies: { tl_client_session: sessionB },
    });
    expect(crossAccountResponse.statusCode).toBe(404);

    const ownerResponse = await app.inject({
      method: "GET",
      url: `/portal/orders/${orderId}`,
      cookies: { tl_client_session: sessionA },
    });
    expect(ownerResponse.statusCode).toBe(200);

    await app.close();
  });

  it("rejects an unauthenticated request", async () => {
    const app = await buildApp();
    const response = await app.inject({ method: "GET", url: "/portal/orders" });
    expect(response.statusCode).toBe(401);
    await app.close();
  });
});

describe("public and staff order visibility", () => {
  it("accepts a public order with no account", async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/orders",
      payload: { ...validOrder, pickupCompany: "Walk-in Co" },
    });
    expect(response.statusCode).toBe(201);
    const orderId = response.json().id;

    const stored = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
    expect(stored.accountId).toBeNull();
    await prisma.order.delete({ where: { id: orderId } });

    await app.close();
  });

  it("lets staff see orders from every account", async () => {
    const app = await buildApp();
    const { account, user } = await createClient("Portal Test Co Staff View");
    const clientSession = await loginAs(app, user.email);

    await app.inject({
      method: "POST",
      url: "/portal/orders",
      cookies: { tl_client_session: clientSession },
      payload: validOrder,
    });

    const passwordHash = await argon2.hash(PASSWORD, { type: argon2.argon2id });
    const staffUser = await prisma.user.create({
      data: {
        email: `staff-${crypto.randomUUID()}@example.com`,
        name: "Test Staff",
        passwordHash,
        userType: "STAFF",
        status: "ACTIVE",
      },
    });
    cleanupUserIds.push(staffUser.id);

    const staffLogin = await app.inject({ method: "POST", url: "/auth/staff/login", payload: { email: staffUser.email, password: PASSWORD } });
    const staffCookie = staffLogin.cookies.find((c) => c.name === "tl_staff_session")!.value;

    const listResponse = await app.inject({
      method: "GET",
      url: "/staff/orders",
      cookies: { tl_staff_session: staffCookie },
    });
    expect(listResponse.statusCode).toBe(200);
    const found = listResponse.json().items.find((item: { accountId: string | null }) => item.accountId === account.id);
    expect(found).toBeDefined();

    await app.close();
  });
});
