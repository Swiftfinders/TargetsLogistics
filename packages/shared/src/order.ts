import { z } from "zod";

/* ------------------------------------------------------------------ */
/*  Enums                                                             */
/* ------------------------------------------------------------------ */

export const packageTypeSchema = z.enum(["ENVELOPE", "BOX", "PALLET", "OTHER"]);
export type PackageType = z.infer<typeof packageTypeSchema>;

export const vehicleTypeSchema = z.enum(["CAR", "MINI_VAN", "CARGO_VAN", "OTHER"]);
export type VehicleType = z.infer<typeof vehicleTypeSchema>;

export const serviceLevelSchema = z.enum(["SAME_DAY", "NEXT_DAY", "FOUR_HOURS", "HOT_RUSH", "CRITICAL"]);
export type ServiceLevel = z.infer<typeof serviceLevelSchema>;

export const orderStatusSchema = z.enum(["NEW", "ACKNOWLEDGED", "CLOSED"]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

/* ------------------------------------------------------------------ */
/*  Rate card (Target Logistic) — the single source of truth for      */
/*  pricing. Money is integer cents everywhere (CLAUDE.md rule 9).    */
/* ------------------------------------------------------------------ */

// Base rate is set by the vehicle type; package type is descriptive only.
// Weight limits are in lbs (the rate card's unit); the form collects kg.
export const VEHICLE_DETAILS = {
  CARGO_VAN: { label: "Cargo Van", weightLimitLbs: 1500, baseCents: 12000 },
  MINI_VAN: { label: "Mini Van", weightLimitLbs: 200, baseCents: 5500 },
  CAR: { label: "Car", weightLimitLbs: 40, baseCents: 2500 },
  OTHER: { label: "Other", weightLimitLbs: 0, baseCents: 0 },
} as const satisfies Record<VehicleType, { label: string; weightLimitLbs: number; baseCents: number }>;

// Same Day, Next Day, Hot Rush and Critical all bill at the same-day base
// rate; only the 4-Hour Rush adds the +$20 surcharge from the rate card.
export const SERVICE_LEVEL_DETAILS = {
  SAME_DAY: { label: "Same Day", surchargeCents: 0 },
  NEXT_DAY: { label: "Next Day", surchargeCents: 0 },
  FOUR_HOURS: { label: "4 Hours", surchargeCents: 2000 },
  HOT_RUSH: { label: "Hot Rush", surchargeCents: 0 },
  CRITICAL: { label: "Critical", surchargeCents: 0 },
} as const satisfies Record<ServiceLevel, { label: string; surchargeCents: number }>;

export const PACKAGE_TYPE_DETAILS = {
  ENVELOPE: { label: "Envelope" },
  BOX: { label: "Box" },
  PALLET: { label: "Pallet" },
  OTHER: { label: "Other" },
} as const satisfies Record<PackageType, { label: string }>;

const LBS_PER_KG = 2.20462;
const ADDITIONAL_WEIGHT_CENTS_PER_10LBS = 1000; // $10.00 per 10 lbs (or part) over limit
const AFTER_HOURS_MULTIPLIER = 1.25; // +25% premium
const BUSINESS_HOURS_OPEN_MIN = 8 * 60; // 08:00
const BUSINESS_HOURS_CLOSE_MIN = 18 * 60; // 18:00

/**
 * True when the requested pickup falls outside Mon–Fri 08:00–18:00 (or on a
 * weekend). Missing date/time is treated as within business hours — the
 * business confirms the final schedule after submission either way.
 */
export function isAfterHours(pickupDate?: string | null, pickupTime?: string | null): boolean {
  if (!pickupDate) return false;
  const [y, m, d] = pickupDate.split("-").map(Number);
  if (!y || !m || !d) return false;
  const day = new Date(y, m - 1, d).getDay(); // 0 = Sun, 6 = Sat
  if (day === 0 || day === 6) return true;
  if (!pickupTime) return false;
  const [hh, mm] = pickupTime.split(":").map(Number);
  if (hh === undefined || mm === undefined || Number.isNaN(hh) || Number.isNaN(mm)) return false;
  const minutes = hh * 60 + mm;
  return minutes < BUSINESS_HOURS_OPEN_MIN || minutes >= BUSINESS_HOURS_CLOSE_MIN;
}

export interface OrderPriceInput {
  vehicleType?: VehicleType | null | undefined;
  weightKg?: number | null | undefined;
  serviceLevel: ServiceLevel;
  pickupDate?: string | null | undefined;
  pickupTime?: string | null | undefined;
}

/**
 * Estimated price in integer cents, from the Target Logistic rate card.
 * Used by both the web form (live estimate) and the API (stored price) so the
 * two can never drift. Base rate assumes ≤10km — distance beyond that is
 * confirmed by the business after submission, so it isn't priced here.
 * Returns 0 when no priced vehicle is selected (Other, or none yet).
 */
export function estimateOrderPriceCents(input: OrderPriceInput): number {
  const vt = input.vehicleType;
  if (!vt || vt === "OTHER") return 0;

  const details = VEHICLE_DETAILS[vt];
  let cents: number = details.baseCents;

  if (input.weightKg && input.weightKg > 0) {
    const lbs = input.weightKg * LBS_PER_KG;
    if (lbs > details.weightLimitLbs) {
      const over = lbs - details.weightLimitLbs;
      const units = Math.ceil(over / 10);
      cents += units * ADDITIONAL_WEIGHT_CENTS_PER_10LBS;
    }
  }

  cents += SERVICE_LEVEL_DETAILS[input.serviceLevel].surchargeCents;

  if (isAfterHours(input.pickupDate, input.pickupTime)) {
    cents = Math.round(cents * AFTER_HOURS_MULTIPLIER);
  }

  return cents;
}

/**
 * Opaque order reference (never a sequential integer — CLAUDE.md rule 9).
 * Generated client-side for immediate display and re-checked for uniqueness
 * server-side, which regenerates on the rare collision.
 */
export function generateOrderReference(): string {
  const six = Math.floor(100000 + Math.random() * 900000);
  const three = Math.floor(100 + Math.random() * 900);
  return `TL-${six}-${three}`;
}

/* ------------------------------------------------------------------ */
/*  Input schema — the API validates with this; the web imports it.   */
/* ------------------------------------------------------------------ */

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

export const createOrderInputSchema = z.object({
  reference: z
    .string()
    .trim()
    .regex(/^TL-\d{6}-\d{3}$/)
    .optional(),

  pickupContactName: optionalText(200),
  pickupCompany: optionalText(200),
  pickupPhone: optionalText(40),
  pickupAddress: z.string().trim().min(1, "Enter a pickup address").max(500),

  deliveryContactName: optionalText(200),
  deliveryCompany: optionalText(200),
  deliveryPhone: optionalText(40),
  deliveryAddress: z.string().trim().min(1, "Enter a delivery address").max(500),

  packageType: packageTypeSchema.optional(),
  pieces: z.coerce.number().int().positive().max(100000).optional(),
  weightKg: z.coerce.number().positive().max(1000000).optional(),
  dimensions: optionalText(200),
  contents: optionalText(1000),
  vehicleType: vehicleTypeSchema.optional(),

  serviceLevel: serviceLevelSchema,
  pickupDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  pickupTime: z
    .string()
    .trim()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  specialInstructions: optionalText(2000),
});
export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;

export const orderResponseSchema = z.object({
  id: z.string(),
  reference: z.string(),
  estimatedPriceCents: z.number().int(),
  createdAt: z.string(),
});
export type OrderResponse = z.infer<typeof orderResponseSchema>;

export const updateOrderStatusInputSchema = z.object({
  status: orderStatusSchema,
});
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusInputSchema>;
