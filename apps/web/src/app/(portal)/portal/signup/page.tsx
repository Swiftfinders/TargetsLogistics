import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { SignupForm } from "@/components/signup-form";

export const metadata: Metadata = {
  title: "Request client access",
  robots: { index: false, follow: false },
};

export default function PortalSignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-raised px-5 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-bg p-8">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="mt-6 text-center text-xl font-extrabold text-ink">Request client access</h1>
        <p className="mt-1 text-center text-sm text-ink-muted">
          Tell us who you are and we&apos;ll set your account up.
        </p>
        <div className="mt-6">
          <SignupForm />
        </div>
        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link href="/portal/login" prefetch={false} className="font-semibold text-accent">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
