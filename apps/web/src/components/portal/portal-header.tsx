"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { buttonClasses } from "@/components/ui/button";
import { publicEnv } from "@/lib/public-env";
import type { SessionUser } from "@/lib/use-session";

export function PortalHeader({ user, homeHref }: { user: SessionUser; homeHref: string }) {
  const router = useRouter();

  async function handleLogout() {
    const kind = user.userType === "STAFF" ? "staff" : "client";
    await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/auth/${kind}/logout`, { method: "POST", credentials: "include" });
    router.push(kind === "staff" ? "/staff/login" : "/portal/login");
    router.refresh();
  }

  return (
    <header className="border-b border-line bg-bg">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
        <Link href={homeHref}>
          <Logo />
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-ink-muted">{user.name}</span>
          <button type="button" onClick={handleLogout} className={buttonClasses("outline", "sm")}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
