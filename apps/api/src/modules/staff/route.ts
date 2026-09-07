import type { FastifyInstance } from "fastify";
import { createClientInputSchema, orderStatusSchema, updateOrderStatusInputSchema } from "@targets/shared";
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
  app.get("/staff/orders", { preHandler: requireStaff }, async (request, reply) => {
    const query = request.query as { cursor?: string; limit?: string; status?: string };
    const limit = Math.min(Number(query.limit) || DEFAULT_LIMIT, MAX_LIMIT);
    const statusFilter = orderStatusSchema.safeParse(query.status);

    const items = await prisma.order.findMany({
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

  app.patch("/staff/orders/:id/status", { preHandler: requireStaff }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = updateOrderStatusInputSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_input" });

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ error: "not_found" });

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.order.update({ where: { id }, data: { status: parsed.data.status } });
      await writeAuditLog({
        actorId: request.authUser!.id,
        action: "order.status_updated",
        entityType: "order",
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
      const result = await tx.user.update({ where: { id }, data: { status: "ACTIVE" } });
      await writeAuditLog({
        actorId: request.authUser!.id,
        action: "signup.approved",
        entityType: "user",
        entityId: id,
        before: { status: existing.status },
        after: { status: "ACTIVE" },
        ip: request.ip,
      });
      return result;
    });

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
      newOrders,
      totalOrders,
      acknowledgedOrders,
      closedOrders,
      totalClientUsers,
    ] = await Promise.all([
      prisma.account.count(),
      prisma.user.count({ where: { userType: "CLIENT", status: "PENDING" } }),
      prisma.order.count({ where: { status: "NEW" } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "ACKNOWLEDGED" } }),
      prisma.order.count({ where: { status: "CLOSED" } }),
      prisma.user.count({ where: { userType: "CLIENT" } }),
    ]);

    return reply.send({
      totalClients,
      pendingSignups,
      newOrders,
      totalOrders,
      acknowledgedOrders,
      closedOrders,
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
        _count: { select: { orders: true } },
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
}
