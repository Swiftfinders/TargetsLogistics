import type { FastifyInstance } from "fastify";
import { forgotPasswordInputSchema, loginInputSchema, resetPasswordInputSchema } from "@targets/shared";
import { setSessionCookie, clearSessionCookie, COOKIE_NAMES } from "../../lib/cookies.js";
import { createSession, revokeSession } from "../../lib/session.js";
import { requireClient, requireStaff } from "../../lib/auth-middleware.js";
import { attemptLogin } from "./service.js";
import { requestPasswordReset, resetPasswordWithToken } from "./password-reset-service.js";

const LOGIN_RATE_LIMIT = { max: 10, timeWindow: "15 minutes" };

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/staff/login", { config: { rateLimit: LOGIN_RATE_LIMIT } }, async (request, reply) => {
    const parsed = loginInputSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_input" });

    const result = await attemptLogin(parsed.data.email, parsed.data.password, "STAFF");
    if (!result.ok) return reply.code(401).send({ error: "invalid_credentials" });

    const { token, expiresAt } = await createSession({
      userId: result.user.id,
      userType: "STAFF",
      ip: request.ip,
      userAgent: request.headers["user-agent"],
    });
    setSessionCookie(reply, "STAFF", token, expiresAt);
    return reply.send({ user: result.user });
  });

  app.post("/auth/staff/logout", async (request, reply) => {
    const token = request.cookies[COOKIE_NAMES.STAFF];
    if (token) await revokeSession(token);
    clearSessionCookie(reply, "STAFF");
    return reply.code(204).send();
  });

  app.get("/auth/staff/me", { preHandler: requireStaff }, async (request, reply) => {
    return reply.send({ user: request.authUser });
  });

  app.post("/auth/client/login", { config: { rateLimit: LOGIN_RATE_LIMIT } }, async (request, reply) => {
    const parsed = loginInputSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_input" });

    const result = await attemptLogin(parsed.data.email, parsed.data.password, "CLIENT");
    if (!result.ok) return reply.code(401).send({ error: "invalid_credentials" });

    const { token, expiresAt } = await createSession({
      userId: result.user.id,
      userType: "CLIENT",
      ip: request.ip,
      userAgent: request.headers["user-agent"],
    });
    setSessionCookie(reply, "CLIENT", token, expiresAt);
    return reply.send({ user: result.user });
  });

  app.post("/auth/client/logout", async (request, reply) => {
    const token = request.cookies[COOKIE_NAMES.CLIENT];
    if (token) await revokeSession(token);
    clearSessionCookie(reply, "CLIENT");
    return reply.code(204).send();
  });

  app.get("/auth/client/me", { preHandler: requireClient }, async (request, reply) => {
    return reply.send({ user: request.authUser });
  });

  app.post("/auth/password/forgot", { config: { rateLimit: LOGIN_RATE_LIMIT } }, async (request, reply) => {
    const parsed = forgotPasswordInputSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_input" });

    await requestPasswordReset(parsed.data.email);
    // Same response whether or not the email exists — never confirm existence.
    return reply.send({ ok: true });
  });

  app.post("/auth/password/reset", { config: { rateLimit: LOGIN_RATE_LIMIT } }, async (request, reply) => {
    const parsed = resetPasswordInputSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_input" });

    const result = await resetPasswordWithToken(parsed.data.token, parsed.data.password);
    if (!result.ok) return reply.code(400).send({ error: "invalid_or_expired_token" });
    return reply.send({ ok: true });
  });
}
