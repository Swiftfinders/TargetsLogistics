import type { FastifyInstance } from "fastify";
import { createClientInputSchema, requestStatusSchema, updateShipmentRequestStatusInputSchema } from "@targets/shared";
import { prisma } from "../../lib/db.js";
import { requireStaff } from "../../lib/auth-middleware.js";
import { writeAuditLog } from "../../lib/audit.js";
import { hashPassword } from "../../lib/password.js";
import { issuePasswordSetupToken } from "../auth/password-reset-service.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
// Placeholder password, immediately made unusable by requiring a set-password
// token before login — never actually shared with the client (no dependency
// on a random-string generator for something that's never used as a password).
const UNUSABLE_PLACEHOLDER_PASSWORD = "invited-account-must-set-password-via-emailed-link";

export async function staffRoutes(app: FastifyInstance) {
  app.get("/staff/requests", { preHandler: requireStaff }, async (request, reply) => {
    const query = request.query as { cursor?: string; limit?: string; status?: string };
    const limit = Math.min(Number(query.limit) || DEFAULT_LIMIT, MAX_LIMIT);
    const statusFilter = requestStatusSchema.safeParse(query.status);

    const items = await prisma.shipmentRequest.findMany({
      ...(statusFilter.success ? { where: { status: statusFilter.data } } : {}),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      include: { account: { select: { name: true } } },
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    });

    const hasMore = items.length > limit;
    const page = hasMore ? items.slice(0, limit) : items;

    return reply.send({ items: page, nextCursor: hasMore ? page[page.length - 1]?.id : null });
  });

  app.get("/staff/requests/:id", { preHandler: requireStaff }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const item = await prisma.shipmentRequest.findUnique({
      where: { id },
      include: { account: { select: { name: true } }, createdBy: { select: { name: true, email: true } } },
    });
    if (!item) return reply.code(404).send({ error: "not_found" });
    return reply.send(item);
  });

  app.patch("/staff/requests/:id/status", { preHandler: requireStaff }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = updateShipmentRequestStatusInputSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_input" });

    const existing = await prisma.shipmentRequest.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ error: "not_found" });

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.shipmentRequest.update({ where: { id }, data: { status: parsed.data.status } });
      await writeAuditLog({
        actorId: request.authUser!.id,
        action: "shipment_request.status_updated",
        entityType: "shipment_request",
        entityId: id,
        before: { status: existing.status },
        after: { status: parsed.data.status },
        ip: request.ip,
      });
      return result;
    });

    return reply.send(updated);
  });

  app.post("/staff/clients", { preHandler: requireStaff }, async (request, reply) => {
    const parsed = createClientInputSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_input", issues: parsed.error.flatten().fieldErrors });

    const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existingUser) return reply.code(409).send({ error: "email_already_in_use" });

    const passwordHash = await hashPassword(UNUSABLE_PLACEHOLDER_PASSWORD);

    const { account, user } = await prisma.$transaction(async (tx) => {
      const newAccount = await tx.account.create({ data: { name: parsed.data.accountName } });
      const newUser = await tx.user.create({
        data: {
          email: parsed.data.email,
          name: parsed.data.userName,
          passwordHash,
          userType: "CLIENT",
          status: "INVITED",
          accountId: newAccount.id,
        },
      });
      await writeAuditLog({
        actorId: request.authUser!.id,
        action: "client.created",
        entityType: "account",
        entityId: newAccount.id,
        after: { accountName: newAccount.name, userEmail: newUser.email },
        ip: request.ip,
      });
      return { account: newAccount, user: newUser };
    });

    await issuePasswordSetupToken(user.id, "invite");

    return reply.code(201).send({ account, user: { id: user.id, email: user.email, name: user.name } });
  });

  app.get("/staff/signups", { preHandler: requireStaff }, async (request, reply) => {
    const query = request.query as { cursor?: string; limit?: string };
    const limit = Math.min(Number(query.limit) || DEFAULT_LIMIT, MAX_LIMIT);

    const items = await prisma.user.findMany({
      where: { status: "PENDING" },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      include: { account: { select: { name: true } } },
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    });

    const hasMore = items.length > limit;
    const page = hasMore ? items.slice(0, limit) : items;
    const body = page.map((item) => ({
      id: item.id,
      email: item.email,
      name: item.name,
      accountName: item.account?.name ?? null,
      createdAt: item.createdAt,
    }));

    return reply.send({ items: body, nextCursor: hasMore ? page[page.length - 1]?.id : null });
  });

  app.post("/staff/signups/:id/approve", { preHandler: requireStaff }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.status !== "PENDING") return reply.code(404).send({ error: "not_found" });

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.user.update({ where: { id }, data: { status: "INVITED" } });
      await writeAuditLog({
        actorId: request.authUser!.id,
        action: "signup.approved",
        entityType: "user",
        entityId: id,
        before: { status: existing.status },
        after: { status: "INVITED" },
        ip: request.ip,
      });
      return result;
    });

    await issuePasswordSetupToken(updated.id, "invite");

    return reply.send({ id: updated.id, status: updated.status });
  });

  app.post("/staff/signups/:id/reject", { preHandler: requireStaff }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.status !== "PENDING") return reply.code(404).send({ error: "not_found" });

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.user.update({ where: { id }, data: { status: "SUSPENDED" } });
      await writeAuditLog({
        actorId: request.authUser!.id,
        action: "signup.rejected",
        entityType: "user",
        entityId: id,
        before: { status: existing.status },
        after: { status: "SUSPENDED" },
        ip: request.ip,
      });
      return result;
    });

    return reply.send({ id: updated.id, status: updated.status });
  });

  app.get("/staff/analytics", { preHandler: requireStaff }, async (_request, reply) => {
    const [
      totalClients,
      pendingSignups,
      newRequests,
      totalRequests,
      acknowledgedRequests,
      closedRequests,
      totalContacts,
      totalClientUsers,
    ] = await Promise.all([
      prisma.account.count(),
      prisma.user.count({ where: { userType: "CLIENT", status: "PENDING" } }),
      prisma.shipmentRequest.count({ where: { status: "NEW" } }),
      prisma.shipmentRequest.count(),
      prisma.shipmentRequest.count({ where: { status: "ACKNOWLEDGED" } }),
      prisma.shipmentRequest.count({ where: { status: "CLOSED" } }),
      prisma.contactSubmission.count(),
      prisma.user.count({ where: { userType: "CLIENT" } }),
    ]);

    return reply.send({
      totalClients,
      pendingSignups,
      newRequests,
      totalRequests,
      acknowledgedRequests,
      closedRequests,
      totalContacts,
      totalClientUsers,
    });
  });

  app.get("/staff/clients", { preHandler: requireStaff }, async (request, reply) => {
    const query = request.query as { cursor?: string; limit?: string };
    const limit = Math.min(Number(query.limit) || DEFAULT_LIMIT, MAX_LIMIT);

    const accounts = await prisma.account.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      include: {
        users: {
          where: { userType: "CLIENT" },
          select: { id: true, name: true, email: true, status: true },
        },
        _count: { select: { shipmentRequests: true } },
      },
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    });

    const hasMore = accounts.length > limit;
    const page = hasMore ? accounts.slice(0, limit) : accounts;

    return reply.send({
      items: page,
      nextCursor: hasMore ? page[page.length - 1]?.id : null,
    });
  });

  app.get("/staff/contacts", { preHandler: requireStaff }, async (request, reply) => {
    const query = request.query as { cursor?: string; limit?: string };
    const limit = Math.min(Number(query.limit) || DEFAULT_LIMIT, MAX_LIMIT);

    const items = await prisma.contactSubmission.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    });

    const hasMore = items.length > limit;
    const page = hasMore ? items.slice(0, limit) : items;

    return reply.send({
      items: page,
      nextCursor: hasMore ? page[page.length - 1]?.id : null,
    });
  });
}
