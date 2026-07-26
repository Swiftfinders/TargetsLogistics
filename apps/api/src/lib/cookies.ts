import type { CookieSerializeOptions } from "@fastify/cookie";
import type { FastifyReply } from "fastify";
import type { UserType } from "@targets/shared";
import { env } from "./env.js";

export const COOKIE_NAMES: Record<UserType, string> = {
  STAFF: "tl_staff_session",
  CLIENT: "tl_client_session",
};

function baseCookieOptions(): CookieSerializeOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  };
}

export function setSessionCookie(reply: FastifyReply, userType: UserType, token: string, expiresAt: Date) {
  reply.setCookie(COOKIE_NAMES[userType], token, { ...baseCookieOptions(), expires: expiresAt });
}

export function clearSessionCookie(reply: FastifyReply, userType: UserType) {
  reply.clearCookie(COOKIE_NAMES[userType], baseCookieOptions());
}
