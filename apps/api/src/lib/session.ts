import type { UserType } from "@targets/shared";
import { prisma } from "./db.js";
import { generateToken, hashToken } from "./tokens.js";

const SLIDING_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const ABSOLUTE_CAP_MS = 30 * 24 * 60 * 60 * 1000;
const REFRESH_THRESHOLD_MS = 24 * 60 * 60 * 1000;

export interface CreateSessionInput {
  userId: string;
  userType: UserType;
  ip?: string | undefined;
  userAgent?: string | undefined;
}

export async function createSession(input: CreateSessionInput): Promise<{ token: string; expiresAt: Date }> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SLIDING_WINDOW_MS);

  await prisma.session.create({
    data: {
      userId: input.userId,
      userType: input.userType,
      tokenHash: hashToken(token),
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export interface ValidatedSession {
  sessionId: string;
  user: {
    id: string;
    email: string;
    name: string;
    userType: UserType;
    accountId: string | null;
    status: string;
  };
}

/** Looks up a raw session token, enforcing expiry/revocation and the expected
 * userType (a client token is structurally incapable of passing a staff
 * check, and vice versa — never inferred from the user row alone). */
export async function validateSession(token: string, expectedUserType: UserType): Promise<ValidatedSession | null> {
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session || session.revokedAt || session.expiresAt < new Date()) return null;
  if (session.userType !== expectedUserType) return null;
  if (session.user.status !== "ACTIVE") return null;

  const createdAt = session.createdAt.getTime();
  const now = Date.now();
  const absoluteExpiry = createdAt + ABSOLUTE_CAP_MS;
  if (now > absoluteExpiry) return null;

  const remaining = session.expiresAt.getTime() - now;
  if (remaining < SLIDING_WINDOW_MS - REFRESH_THRESHOLD_MS) {
    const nextExpiry = new Date(Math.min(now + SLIDING_WINDOW_MS, absoluteExpiry));
    await prisma.session.update({ where: { id: session.id }, data: { expiresAt: nextExpiry } });
  }

  return {
    sessionId: session.id,
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      userType: session.user.userType as UserType,
      accountId: session.user.accountId,
      status: session.user.status,
    },
  };
}

export async function revokeSession(token: string): Promise<void> {
  await prisma.session.updateMany({
    where: { tokenHash: hashToken(token), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAllSessionsForUser(userId: string): Promise<void> {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
