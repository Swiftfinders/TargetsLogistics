import { Resend } from "resend";
import { env } from "./env.js";
import { logger } from "./logger.js";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

// No verified sending domain yet (CLAUDE.md: [DOMAIN] is still a placeholder).
// Resend's shared address works without domain verification; swap for a real
// address on our own domain once one exists.
const FROM_ADDRESS = "Targets Logistics <onboarding@resend.dev>";

export const CONTACT_NOTIFICATION_EMAIL = "kr2011@live.ca";

interface ContactNotification {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  message: string;
}

export async function sendContactNotification(submission: ContactNotification): Promise<void> {
  if (!resend) {
    logger.warn("RESEND_API_KEY not set — skipping contact notification email");
    return;
  }

  const lines = [
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    submission.phone ? `Phone: ${submission.phone}` : null,
    submission.company ? `Company: ${submission.company}` : null,
    "",
    submission.message,
  ].filter((line): line is string => line !== null);

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: CONTACT_NOTIFICATION_EMAIL,
      replyTo: submission.email,
      subject: `New contact form submission from ${submission.name}`,
      text: lines.join("\n"),
    });
  } catch (error) {
    // Best-effort: the submission is already durably stored in Postgres, so a
    // failed notification email should never fail the request or lose the lead.
    logger.error({ err: error }, "failed to send contact notification email");
  }
}

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

export async function sendShipmentRequestNotification(request: {
  pickupAddress: string;
  dropoffAddress: string;
  description: string;
  neededBy: Date;
  serviceTier: string;
  loadSize: string;
  pieces?: number | null;
  weightKg?: number | null;
  accountName: string;
  submittedBy: string;
}): Promise<void> {
  if (!resend) {
    logger.warn("RESEND_API_KEY not set — skipping shipment request notification email");
    return;
  }

  const lines = [
    `Account: ${request.accountName}`,
    `Submitted by: ${request.submittedBy}`,
    "",
    `Pickup: ${request.pickupAddress}`,
    `Dropoff: ${request.dropoffAddress}`,
    `Description: ${request.description}`,
    `Service tier: ${request.serviceTier}`,
    `Load size: ${request.loadSize}`,
    `Needed by: ${request.neededBy.toLocaleString("en-CA")}`,
    request.pieces != null ? `Pieces: ${request.pieces}` : null,
    request.weightKg != null ? `Weight: ${request.weightKg} kg` : null,
  ].filter((line): line is string => line !== null);

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: CONTACT_NOTIFICATION_EMAIL,
      subject: `New shipment request from ${request.accountName}`,
      text: lines.join("\n"),
    });
  } catch (error) {
    logger.error({ err: error }, "failed to send shipment request notification email");
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
