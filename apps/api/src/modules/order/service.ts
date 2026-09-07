import { estimateOrderPriceCents, generateOrderReference, type CreateOrderInput } from "@targets/shared";
import { prisma } from "../../lib/db.js";
import { writeAuditLog } from "../../lib/audit.js";
import { sendOrderNotification } from "../../lib/email.js";

interface CreateOrderParams {
  input: CreateOrderInput;
  accountId?: string | null;
  createdByUserId?: string | null;
  submittedByLabel: string;
  ip?: string;
}

// The reference is generated client-side for display and re-checked here so it
// stays unique; a client-supplied or freshly generated collision is replaced.
async function resolveUniqueReference(preferred?: string): Promise<string> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const candidate = attempt === 0 && preferred ? preferred : generateOrderReference();
    const clash = await prisma.order.findUnique({ where: { reference: candidate }, select: { id: true } });
    if (!clash) return candidate;
  }
  throw new Error("could not allocate a unique order reference");
}

export async function createOrder(params: CreateOrderParams) {
  const { input } = params;
  const reference = await resolveUniqueReference(input.reference);
  const estimatedPriceCents = estimateOrderPriceCents(input);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        reference,
        accountId: params.accountId ?? null,
        createdByUserId: params.createdByUserId ?? null,
        pickupContactName: input.pickupContactName ?? null,
        pickupCompany: input.pickupCompany ?? null,
        pickupPhone: input.pickupPhone ?? null,
        pickupAddress: input.pickupAddress,
        deliveryContactName: input.deliveryContactName ?? null,
        deliveryCompany: input.deliveryCompany ?? null,
        deliveryPhone: input.deliveryPhone ?? null,
        deliveryAddress: input.deliveryAddress,
        packageType: input.packageType ?? null,
        pieces: input.pieces ?? null,
        weightKg: input.weightKg ?? null,
        dimensions: input.dimensions ?? null,
        contents: input.contents ?? null,
        vehicleType: input.vehicleType ?? null,
        serviceLevel: input.serviceLevel,
        pickupDate: input.pickupDate ?? null,
        pickupTime: input.pickupTime ?? null,
        specialInstructions: input.specialInstructions ?? null,
        estimatedPriceCents,
      },
    });

    await writeAuditLog({
      ...(params.createdByUserId ? { actorId: params.createdByUserId } : {}),
      action: "order.created",
      entityType: "order",
      entityId: created.id,
      after: { reference: created.reference, estimatedPriceCents },
      ...(params.ip ? { ip: params.ip } : {}),
    });

    return created;
  });

  // Fire-and-forget: the order is durably stored above, so a slow or failing
  // email provider must never hold up or fail the response.
  void sendOrderNotification({ ...order, submittedBy: params.submittedByLabel });

  return order;
}
