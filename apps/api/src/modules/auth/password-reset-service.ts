import { prisma } from "../../lib/db.js";
import { hashPassword } from "../../lib/password.js";
import { generateToken, hashToken } from "../../lib/tokens.js";
import { revokeAllSessionsForUser } from "../../lib/session.js";
import { sendPasswordSetupEmail } from "../../lib/email.js";

const TOKEN_EXPIRY_MS = 30 * 60 * 1000;

export async function issuePasswordSetupToken(userId: string, purpose: "invite" | "reset"): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const token = generateToken();

  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS),
    },
  });

  await sendPasswordSetupEmail({ to: user.email, name: user.name, token, purpose });
}

/** Always returns void and never reveals whether the email exists — the
 * caller sends the same generic response either way. */
export async function requestPasswordReset(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.status !== "ACTIVE") return;
  await issuePasswordSetupToken(user.id, "reset");
}

export type ResetPasswordResult = { ok: true } | { ok: false };

export async function resetPasswordWithToken(rawToken: string, newPassword: string): Promise<ResetPasswordResult> {
  const tokenHash = hashToken(rawToken);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { ok: false };
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash, status: "ACTIVE", failedLoginAttempts: 0, lockedUntil: null },
    }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  // Password change revokes all other sessions (CLAUDE.md).
  await revokeAllSessionsForUser(record.userId);

  return { ok: true };
}
