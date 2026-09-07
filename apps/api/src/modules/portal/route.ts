import type { FastifyInstance } from "fastify";
import { createOrderInputSchema, type OrderResponse } from "@targets/shared";
import { prisma } from "../../lib/db.js";
import { createOrder } from "../order/service.js";
import { requireClient } from "../../lib/auth-middleware.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function portalRoutes(app: FastifyInstance) {
  app.get("/portal/orders", { preHandler: requireClient }, async (request, reply) => {
    const accountId = request.authUser?.accountId;
    if (!accountId) return reply.code(403).send({ error: "no_account" });

    const query = request.query as { cursor?: string; limit?: string };
    const limit = Math.min(Number(query.limit) || DEFAULT_LIMIT, MAX_LIMIT);

    const items = await prisma.order.findMany({
      where: { accountId },
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

  app.post("/portal/orders", { preHandler: requireClient }, async (request, reply) => {
    const accountId = request.authUser?.accountId;
    if (!accountId) return reply.code(403).send({ error: "no_account" });

    const parsed = createOrderInputSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_input", issues: parsed.error.flatten().fieldErrors });
    }

    const account = await prisma.account.findUnique({ where: { id: accountId }, select: { name: true } });
    const order = await createOrder({
      input: parsed.data,
      accountId,
      createdByUserId: request.authUser!.id,
      submittedByLabel: account?.name ?? "Client",
      ip: request.ip,
    });

    const body: OrderResponse = {
      id: order.id,
      reference: order.reference,
      estimatedPriceCents: order.estimatedPriceCents,
      createdAt: order.createdAt.toISOString(),
    };

    return reply.code(201).send(body);
  });

  // Scoped by account_id at the repository layer (the where clause), so no route
  // can forget — a client can never see another account's order, and requesting
  // one by ID returns 404, never 403, so existence isn't leaked.
  app.get("/portal/orders/:id", { preHandler: requireClient }, async (request, reply) => {
    const accountId = request.authUser?.accountId;
    if (!accountId) return reply.code(403).send({ error: "no_account" });

    const { id } = request.params as { id: string };
    const item = await prisma.order.findFirst({ where: { id, accountId } });
    if (!item) return reply.code(404).send({ error: "not_found" });

    return reply.send(item);
  });
}
