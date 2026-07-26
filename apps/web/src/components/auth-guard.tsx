"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useSession, type SessionUser } from "@/lib/use-session";

export function AuthGuard({
  kind,
  loginPath,
  children,
}: {
  kind: "staff" | "client";
  loginPath: string;
  children: (user: SessionUser) => ReactNode;
}) {
  const session = useSession(kind);
  const router = useRouter();

  useEffect(() => {
    if (session.status === "unauthenticated") router.replace(loginPath);
  }, [session.status, router, loginPath]);

  if (session.status === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-ink-muted">Loading…</p>
      </div>
    );
  }

  if (session.status === "unauthenticated") {
    return null;
  }

  return <>{children(session.user)}</>;
}
