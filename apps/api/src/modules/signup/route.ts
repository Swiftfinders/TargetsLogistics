import type { FastifyInstance } from "fastify";
import { signupRequestInputSchema } from "@targets/shared";
import { prisma } from "../../lib/db.js";
import { hashPassword } from "../../lib/password.js";
import { writeAuditLog } from "../../lib/audit.js";
import { sendSignupNotification } from "../../lib/email.js";

// Same placeholder as staff-created clients — the account can't log in until
// staff approves it and the invite flow sets a real password.
const UNUSABLE_PLACEHOLDER_PASSWORD = "pending-signup-must-be-approved-and-set-password";
const SIGNUP_RATE_LIMIT = { max: 10, timeWindow: "15 minutes" };

export async function signupRoutes(app: FastifyInstance) {
  app.post("/signup", { config: { rateLimit: SIGNUP_RATE_LIMIT } }, async (request, reply) => {
    const parsed = signupRequestInputSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_input", issues: parsed.error.flatten().fieldErrors });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existingUser) return reply.code(409).send({ error: "email_already_in_use" });

    const passwordHash = await hashPassword(UNUSABLE_PLACEHOLDER_PASSWORD);

    const { account, user } = await prisma.$transaction(async (tx) => {
      const newAccount = await tx.account.create({ data: { name: parsed.data.company } });
      const newUser = await tx.user.create({
        data: {
          email: parsed.data.email,
          name: parsed.data.name,
          passwordHash,
          userType: "CLIENT",
          status: "PENDING",
          accountId: newAccount.id,
        },
      });
      await writeAuditLog({
        action: "signup.requested",
        entityType: "account",
        entityId: newAccount.id,
        after: { accountName: newAccount.name, userEmail: newUser.email },
        ip: request.ip,
      });
      return { account: newAccount, user: newUser };
    });

    void sendSignupNotification({ name: user.name, email: user.email, company: account.name });

    return reply.code(201).send({ ok: true });
  });
}
