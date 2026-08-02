import type { UserType } from "./auth.js";

export type Action =
  | "shipmentRequest:create"
  | "shipmentRequest:readOwn"
  | "shipmentRequest:readAny"
  | "shipmentRequest:updateStatus"
  | "client:create"
  | "signup:review";

export interface Actor {
  userType: UserType;
}

/**
 * One file, one function. Every route checks `can()` instead of re-deriving
 * "is this staff" logic inline — see CLAUDE.md rule 5. Only two roles exist
 * right now (STAFF/CLIENT); this grows into a real matrix if roles are added.
 */
export function can(actor: Actor, action: Action): boolean {
  if (actor.userType === "STAFF") {
    return (
      action === "shipmentRequest:readAny" ||
      action === "shipmentRequest:updateStatus" ||
      action === "client:create" ||
      action === "signup:review"
    );
  }

  // CLIENT
  return action === "shipmentRequest:create" || action === "shipmentRequest:readOwn";
}
