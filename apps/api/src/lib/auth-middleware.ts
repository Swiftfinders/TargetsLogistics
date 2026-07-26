import type { FastifyReply, FastifyRequest } from "fastify";
import type { UserType } from "@targets/shared";
import { COOKIE_NAMES } from "./cookies.js";
import { validateSession, type ValidatedSession } from "./session.js";

declare module "fastify" {
  interface FastifyRequest {
    authUser?: ValidatedSession["user"];
  }
}

function requireAuth(userType: UserType) {
  return async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    const token = request.cookies[COOKIE_NAMES[userType]];
    if (!token) {
      return reply.code(401).send({ error: "unauthenticated" });
    }

    const session = await validateSession(token, userType);
    if (!session) {
      return reply.code(401).send({ error: "unauthenticated" });
    }

    request.authUser = session.user;
  };
}

export const requireStaff = requireAuth("STAFF");
export const requireClient = requireAuth("CLIENT");
