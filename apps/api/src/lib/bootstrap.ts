import { prisma } from "./db.js";
import { hashPassword } from "./password.js";
import { logger } from "./logger.js";

export async function bootstrapAdmin() {
  const email = process.env.STAFF_EMAIL || "kr2011@live.ca";
  const password = process.env.STAFF_PASSWORD || "@targetslogistics";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: {
      email,
      name: "Admin",
      passwordHash,
      userType: "STAFF",
      status: "ACTIVE",
    },
  });
  logger.info({ email }, "bootstrap: created staff account");
}
