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
