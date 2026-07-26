import type { CookieSerializeOptions } from "@fastify/cookie";
import type { FastifyReply } from "fastify";
import type { UserType } from "@targets/shared";
import { env } from "./env.js";

export const COOKIE_NAMES: Record<UserType, string> = {
  STAFF: "tl_staff_session",
  CLIENT: "tl_client_session",
};

function baseCookieOptions(): CookieSerializeOptions {
  const secure = env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure,
    // Vercel (www) and Railway (api) are different sites without a custom
    // domain attached — SameSite=Lax excludes the cookie from cross-site
    // fetch() entirely, not just top-level navigation, so login would set a
    // cookie the browser then never sends back. SameSite=None (only valid
    // with Secure, hence only in production) fixes that in browsers that
    // don't block third-party cookies outright — Safari and Firefox do
    // regardless of this setting, and only a real shared domain fixes that.
    // Switch back to "lax" once COOKIE_DOMAIN scopes both to one site.
    sameSite: secure ? "none" : "lax",
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
