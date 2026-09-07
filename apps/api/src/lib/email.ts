import { Resend } from "resend";
import {
  PACKAGE_TYPE_DETAILS,
  SERVICE_LEVEL_DETAILS,
  VEHICLE_DETAILS,
  type PackageType,
  type ServiceLevel,
  type VehicleType,
} from "@targets/shared";
import { env } from "./env.js";
import { logger } from "./logger.js";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

// No verified sending domain yet (CLAUDE.md: [DOMAIN] is still a placeholder).
// Resend's shared address works without domain verification; swap for a real
// address on our own domain once one exists.
const FROM_ADDRESS = "Targets Logistics <onboarding@resend.dev>";

export const CONTACT_NOTIFICATION_EMAIL = "kr2011@live.ca";

export async function sendSignupNotification(signup: { name: string; email: string; company: string }): Promise<void> {
  if (!resend) {
    logger.warn("RESEND_API_KEY not set — skipping signup notification email");
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: CONTACT_NOTIFICATION_EMAIL,
      replyTo: signup.email,
      subject: `New client signup awaiting approval: ${signup.company}`,
      text: `${signup.name} (${signup.email}) at ${signup.company} requested portal access.\n\nApprove or reject from the staff dashboard.`,
    });
  } catch (error) {
    logger.error({ err: error }, "failed to send signup notification email");
  }
}

export interface OrderNotification {
  reference: string;
  pickupContactName?: string | null;
  pickupCompany?: string | null;
  pickupPhone?: string | null;
  pickupAddress: string;
  deliveryContactName?: string | null;
  deliveryCompany?: string | null;
  deliveryPhone?: string | null;
  deliveryAddress: string;
  packageType?: PackageType | null;
  pieces?: number | null;
  weightKg?: number | null;
  dimensions?: string | null;
  contents?: string | null;
  vehicleType?: VehicleType | null;
  serviceLevel: ServiceLevel;
  pickupDate?: string | null;
  pickupTime?: string | null;
  specialInstructions?: string | null;
  estimatedPriceCents: number;
  submittedBy: string; // account/company name, or "Public website"
}

export async function sendOrderNotification(order: OrderNotification): Promise<void> {
  if (!resend) {
    logger.warn("RESEND_API_KEY not set — skipping order notification email");
    return;
  }

  const price = `$${(order.estimatedPriceCents / 100).toFixed(2)}`;
  const schedule = [order.pickupDate, order.pickupTime].filter(Boolean).join(" ");

  const lines = [
    `Order reference: ${order.reference}`,
    `Submitted by: ${order.submittedBy}`,
    `Estimated price: ${price}`,
    "",
    "PICKUP",
    order.pickupContactName ? `  Contact: ${order.pickupContactName}` : null,
    order.pickupCompany ? `  Company: ${order.pickupCompany}` : null,
    order.pickupPhone ? `  Phone: ${order.pickupPhone}` : null,
    `  Address: ${order.pickupAddress}`,
    "",
    "DELIVERY",
    order.deliveryContactName ? `  Contact: ${order.deliveryContactName}` : null,
    order.deliveryCompany ? `  Company: ${order.deliveryCompany}` : null,
    order.deliveryPhone ? `  Phone: ${order.deliveryPhone}` : null,
    `  Address: ${order.deliveryAddress}`,
    "",
    "SHIPMENT",
    order.packageType ? `  Package type: ${PACKAGE_TYPE_DETAILS[order.packageType].label}` : null,
    order.pieces != null ? `  Packages: ${order.pieces}` : null,
    order.weightKg != null ? `  Weight: ${order.weightKg} kg` : null,
    order.dimensions ? `  Dimensions: ${order.dimensions}` : null,
    order.contents ? `  Contents: ${order.contents}` : null,
    order.vehicleType ? `  Vehicle: ${VEHICLE_DETAILS[order.vehicleType].label}` : null,
    "",
    "SERVICE",
    `  Service level: ${SERVICE_LEVEL_DETAILS[order.serviceLevel].label}`,
    schedule ? `  Requested pickup: ${schedule}` : null,
    order.specialInstructions ? `  Special instructions: ${order.specialInstructions}` : null,
  ].filter((line): line is string => line !== null);

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: CONTACT_NOTIFICATION_EMAIL,
      subject: `New order ${order.reference} — ${order.submittedBy}`,
      text: lines.join("\n"),
    });
  } catch (error) {
    logger.error({ err: error }, "failed to send order notification email");
  }
}

export async function sendPasswordSetupEmail(params: {
  to: string;
  name: string;
  token: string;
  purpose: "invite" | "reset";
}): Promise<void> {
  if (!resend) {
    logger.warn(`RESEND_API_KEY not set — skipping ${params.purpose} email to ${params.to}`);
    return;
  }

  const link = `${env.WEB_URL}/reset-password?token=${encodeURIComponent(params.token)}`;
  const subject = params.purpose === "invite" ? "Set up your Targets Logistics account" : "Reset your Targets Logistics password";
  const intro =
    params.purpose === "invite"
      ? `Hi ${params.name}, an account has been set up for you at Targets Logistics.`
      : `Hi ${params.name}, we received a request to reset your password.`;

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.to,
      subject,
      text: `${intro}\n\nSet your password here (link expires in 30 minutes):\n${link}\n\nIf you didn't expect this, you can ignore this email.`,
    });
  } catch (error) {
    logger.error({ err: error }, `failed to send ${params.purpose} email`);
  }
}
