"use client";

import { useEffect, useState } from "react";
import { publicEnv } from "@/lib/public-env";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  userType: "STAFF" | "CLIENT";
  accountId: string | null;
}

type SessionState = { status: "loading" } | { status: "authenticated"; user: SessionUser } | { status: "unauthenticated" };

/** Checks the given session ("staff" or "client") on mount via its /me route.
 * Client-side, not SSR — these are internal tools behind noindex, not
 * marketing pages, so this doesn't run afoul of CLAUDE.md rule 10. */
export function useSession(kind: "staff" | "client"): SessionState {
  const [state, setState] = useState<SessionState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/auth/${kind}/me`, { credentials: "include" })
      .then((response) => {
        if (cancelled) return;
        if (!response.ok) {
          setState({ status: "unauthenticated" });
          return;
        }
        return response.json().then((body) => {
          if (!cancelled) setState({ status: "authenticated", user: body.user });
        });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "unauthenticated" });
      });

    return () => {
      cancelled = true;
    };
  }, [kind]);

  return state;
}
