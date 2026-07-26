import { afterEach, describe, expect, it } from "vitest";
import argon2 from "argon2";
import { buildApp } from "../../app.js";
import { prisma } from "../../lib/db.js";

const PASSWORD = "correct-horse-battery-staple";
const cleanupAccountIds: string[] = [];
const cleanupUserIds: string[] = [];

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
    await prisma.shipmentRequest.deleteMany({ where: { createdByUserId: { in: cleanupUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: cleanupUserIds } } });
  }
  if (cleanupAccountIds.length > 0) {
    await prisma.account.deleteMany({ where: { id: { in: cleanupAccountIds } } });
  }
  cleanupUserIds.length = 0;
  cleanupAccountIds.length = 0;
});

describe("client portal shipment requests", () => {
  it("lets a client create and read back their own request", async () => {
    const app = await buildApp();
    const { user } = await createClient("Portal Test Co A");
    const sessionCookie = await loginAs(app, user.email);

    const createResponse = await app.inject({
      method: "POST",
      url: "/portal/requests",
      cookies: { tl_client_session: sessionCookie },
      payload: {
        pickupAddress: "1 Main St, Kitchener, ON",
        dropoffAddress: "2 King St, Waterloo, ON",
        description: "A test parcel",
        neededBy: new Date(Date.now() + 3600_000).toISOString(),
        serviceTier: "SAME_DAY",
      },
    });
    expect(createResponse.statusCode).toBe(201);

    const listResponse = await app.inject({
      method: "GET",
      url: "/portal/requests",
      cookies: { tl_client_session: sessionCookie },
    });
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().items).toHaveLength(1);

    await app.close();
  });

  it("returns 404, not 403, when a client requests another account's shipment request", async () => {
    const app = await buildApp();
    const clientA = await createClient("Portal Test Co A");
    const clientB = await createClient("Portal Test Co B");

    const sessionA = await loginAs(app, clientA.user.email);
    const sessionB = await loginAs(app, clientB.user.email);

    const createResponse = await app.inject({
      method: "POST",
      url: "/portal/requests",
      cookies: { tl_client_session: sessionA },
      payload: {
        pickupAddress: "1 Main St, Kitchener, ON",
        dropoffAddress: "2 King St, Waterloo, ON",
        description: "Belongs to account A only",
        neededBy: new Date(Date.now() + 3600_000).toISOString(),
        serviceTier: "RUSH",
      },
    });
    const requestId = createResponse.json().id;

    const crossAccountResponse = await app.inject({
      method: "GET",
      url: `/portal/requests/${requestId}`,
      cookies: { tl_client_session: sessionB },
    });
    expect(crossAccountResponse.statusCode).toBe(404);

    const ownerResponse = await app.inject({
      method: "GET",
      url: `/portal/requests/${requestId}`,
      cookies: { tl_client_session: sessionA },
    });
    expect(ownerResponse.statusCode).toBe(200);

    await app.close();
  });

  it("rejects an unauthenticated request", async () => {
    const app = await buildApp();
    const response = await app.inject({ method: "GET", url: "/portal/requests" });
    expect(response.statusCode).toBe(401);
    await app.close();
  });
});

describe("staff visibility across accounts", () => {
  it("lets staff see shipment requests from every account", async () => {
    const app = await buildApp();
    const { account, user } = await createClient("Portal Test Co Staff View");
    const clientSession = await loginAs(app, user.email);

    await app.inject({
      method: "POST",
      url: "/portal/requests",
      cookies: { tl_client_session: clientSession },
      payload: {
        pickupAddress: "1 Main St, Kitchener, ON",
        dropoffAddress: "2 King St, Waterloo, ON",
        description: "Staff should see this",
        neededBy: new Date(Date.now() + 3600_000).toISOString(),
        serviceTier: "OVERNIGHT",
      },
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
      url: "/staff/requests",
      cookies: { tl_staff_session: staffCookie },
    });
    expect(listResponse.statusCode).toBe(200);
    const found = listResponse.json().items.find((item: { accountId: string }) => item.accountId === account.id);
    expect(found).toBeDefined();

    await app.close();
  });
});
