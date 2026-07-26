import { z } from "zod";

export const serviceTierSchema = z.enum(["SAME_DAY", "RUSH", "OVERNIGHT", "SCHEDULED"]);
export type ServiceTier = z.infer<typeof serviceTierSchema>;

export const requestStatusSchema = z.enum(["NEW", "ACKNOWLEDGED", "CLOSED"]);
export type RequestStatus = z.infer<typeof requestStatusSchema>;

export const createShipmentRequestInputSchema = z.object({
  pickupAddress: z.string().trim().min(1, "Enter a pickup address").max(300),
  dropoffAddress: z.string().trim().min(1, "Enter a dropoff address").max(300),
  description: z.string().trim().min(1, "Describe what's being shipped").max(2000),
  neededBy: z.string().datetime({ message: "Enter a valid date and time" }),
  serviceTier: serviceTierSchema,
  pieces: z.coerce.number().int().positive().optional(),
  weightKg: z.coerce.number().positive().optional(),
});
export type CreateShipmentRequestInput = z.infer<typeof createShipmentRequestInputSchema>;

export const updateShipmentRequestStatusInputSchema = z.object({
  status: requestStatusSchema,
});
export type UpdateShipmentRequestStatusInput = z.infer<typeof updateShipmentRequestStatusInputSchema>;
