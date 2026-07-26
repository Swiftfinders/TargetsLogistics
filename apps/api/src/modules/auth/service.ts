import type { UserType } from "@targets/shared";
import { prisma } from "../../lib/db.js";
import { hashPassword, verifyPassword } from "../../lib/password.js";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

// A real argon2id hash of a random value, verified against on every "user not
// found" / "account locked" path so those cases take the same time as a real
// password check — otherwise response timing alone reveals which case it was.
let dummyHash: string | null = null;
async function getDummyHash(): Promise<string> {
  if (!dummyHash) dummyHash = await hashPassword("not-a-real-password-just-for-timing");
  return dummyHash;
}

export type LoginResult =
  | { ok: true; user: { id: string; email: string; name: string; userType: UserType; accountId: string | null } }
  | { ok: false };

export async function attemptLogin(email: string, password: string, expectedUserType: UserType): Promise<LoginResult> {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.userType !== expectedUserType || user.status !== "ACTIVE") {
    await verifyPassword(await getDummyHash(), password);
    return { ok: false };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    await verifyPassword(await getDummyHash(), password);
    return { ok: false };
  }

  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) {
    const failedLoginAttempts = user.failedLoginAttempts + 1;
    const lockedUntil = failedLoginAttempts >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null;
    await prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts, lockedUntil } });
    return { ok: false };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType as UserType,
      accountId: user.accountId,
    },
  };
}
