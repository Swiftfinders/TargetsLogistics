import { z } from "zod";

export const serviceTierSchema = z.enum(["SAME_DAY", "RUSH", "OVERNIGHT", "SCHEDULED"]);
export type ServiceTier = z.infer<typeof serviceTierSchema>;

export const loadSizeSchema = z.enum(["SMALL", "MEDIUM", "LARGE"]);
export type LoadSize = z.infer<typeof loadSizeSchema>;

export const LOAD_SIZE_DETAILS = {
  SMALL:  { label: "Small",  vehicle: "Car",       weightLimit: "Up to 40 lbs",    priceCents: 2500 },
  MEDIUM: { label: "Medium", vehicle: "Mini Van",  weightLimit: "Up to 200 lbs",   priceCents: 5500 },
  LARGE:  { label: "Large",  vehicle: "Cargo Van", weightLimit: "Up to 1,500 lbs", priceCents: 12000 },
} as const satisfies Record<LoadSize, { label: string; vehicle: string; weightLimit: string; priceCents: number }>;

export const requestStatusSchema = z.enum(["NEW", "ACKNOWLEDGED", "CLOSED"]);
export type RequestStatus = z.infer<typeof requestStatusSchema>;

export const createShipmentRequestInputSchema = z.object({
  pickupAddress: z.string().trim().min(1, "Enter a pickup address").max(300),
  dropoffAddress: z.string().trim().min(1, "Enter a dropoff address").max(300),
  description: z.string().trim().min(1, "Describe what's being shipped").max(2000),
  neededBy: z.string().datetime({ message: "Enter a valid date and time" }),
  serviceTier: serviceTierSchema,
  loadSize: loadSizeSchema,
  pieces: z.coerce.number().int().positive().optional(),
  weightKg: z.coerce.number().positive().optional(),
});
export type CreateShipmentRequestInput = z.infer<typeof createShipmentRequestInputSchema>;

export const updateShipmentRequestStatusInputSchema = z.object({
  status: requestStatusSchema,
});
export type UpdateShipmentRequestStatusInput = z.infer<typeof updateShipmentRequestStatusInputSchema>;
