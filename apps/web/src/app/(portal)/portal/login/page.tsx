import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Client login",
  robots: { index: false, follow: false },
};

export default function PortalLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-raised px-5">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-bg p-8">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="mt-6 text-center text-xl font-extrabold text-ink">Client login</h1>
        <p className="mt-1 text-center text-sm text-ink-muted">Sign in to book and track requests.</p>
        <div className="mt-6">
          <LoginForm kind="client" redirectTo="/portal" />
        </div>
        <p className="mt-6 text-center text-sm text-ink-muted">
          New client?{" "}
          <Link href="/portal/signup" prefetch={false} className="font-semibold text-accent">
            Request access
          </Link>
        </p>
      </div>
    </div>
  );
}
