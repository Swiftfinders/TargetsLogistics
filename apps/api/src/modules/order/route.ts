import type { FastifyInstance } from "fastify";
import { createOrderInputSchema, type OrderResponse } from "@targets/shared";
import { createOrder } from "./service.js";

const ORDER_RATE_LIMIT = { max: 20, timeWindow: "15 minutes" };

// Public, no-auth order submission from the marketing site (/order and
// /contact). Logged-in clients submit through /portal/orders instead.
export async function orderRoutes(app: FastifyInstance) {
  app.post("/orders", { config: { rateLimit: ORDER_RATE_LIMIT } }, async (request, reply) => {
    const parsed = createOrderInputSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_input", issues: parsed.error.flatten().fieldErrors });
    }

    const order = await createOrder({
      input: parsed.data,
      submittedByLabel: parsed.data.pickupCompany ?? "Public website",
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
}
