import type { FastifyInstance } from "fastify";
import {
  createShipmentRequestInputSchema,
  createOrderInputSchema,
  LOAD_SIZE_DETAILS,
  type LoadSize,
  type OrderResponse,
} from "@targets/shared";
import { prisma } from "../../lib/db.js";
import { sendShipmentRequestNotification } from "../../lib/email.js";
import { createOrder } from "../order/service.js";
import { requireClient } from "../../lib/auth-middleware.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function portalRoutes(app: FastifyInstance) {
  app.get("/portal/requests", { preHandler: requireClient }, async (request, reply) => {
    const accountId = request.authUser?.accountId;
    if (!accountId) return reply.code(403).send({ error: "no_account" });

    const query = request.query as { cursor?: string; limit?: string };
    const limit = Math.min(Number(query.limit) || DEFAULT_LIMIT, MAX_LIMIT);

    const items = await prisma.shipmentRequest.findMany({
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

  app.post("/portal/requests", { preHandler: requireClient }, async (request, reply) => {
    const accountId = request.authUser?.accountId;
    if (!accountId) return reply.code(403).send({ error: "no_account" });

    const parsed = createShipmentRequestInputSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_input", issues: parsed.error.flatten().fieldErrors });
    }

    const neededBy = new Date(parsed.data.neededBy);
    const created = await prisma.shipmentRequest.create({
      data: {
        accountId,
        createdByUserId: request.authUser!.id,
        pickupAddress: parsed.data.pickupAddress,
        dropoffAddress: parsed.data.dropoffAddress,
        description: parsed.data.description,
        neededBy,
        serviceTier: parsed.data.serviceTier,
        loadSize: parsed.data.loadSize,
        pieces: parsed.data.pieces ?? null,
        weightKg: parsed.data.weightKg ?? null,
      },
    });

    const account = await prisma.account.findUnique({ where: { id: accountId }, select: { name: true } });
    const loadDetails = LOAD_SIZE_DETAILS[parsed.data.loadSize as LoadSize];
    sendShipmentRequestNotification({
      pickupAddress: parsed.data.pickupAddress,
      dropoffAddress: parsed.data.dropoffAddress,
      description: parsed.data.description,
      neededBy,
      serviceTier: parsed.data.serviceTier,
      loadSize: `${loadDetails.label} — ${loadDetails.vehicle} · ${loadDetails.weightLimit}`,
      pieces: parsed.data.pieces ?? null,
      weightKg: parsed.data.weightKg ?? null,
      accountName: account?.name ?? "Unknown",
      submittedBy: request.authUser!.email,
    }).catch(() => {});

    return reply.code(201).send(created);
  });

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

  // Scoped by account_id at the repository layer (the where clause above), so
  // no route can forget — a client can never see another account's request,
  // and requesting one by ID returns 404, never 403, so existence isn't leaked.
  app.get("/portal/requests/:id", { preHandler: requireClient }, async (request, reply) => {
    const accountId = request.authUser?.accountId;
    if (!accountId) return reply.code(403).send({ error: "no_account" });

    const { id } = request.params as { id: string };
    const item = await prisma.shipmentRequest.findFirst({ where: { id, accountId } });
    if (!item) return reply.code(404).send({ error: "not_found" });

    return reply.send(item);
  });
}
