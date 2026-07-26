import { randomBytes, createHash } from "node:crypto";

/** Opaque, CSPRNG-generated bearer token. The raw value is only ever sent to
 * the client once (as a cookie or in an email link) — only its hash is stored. */
export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
