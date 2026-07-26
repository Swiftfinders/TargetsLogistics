import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Staff login",
  robots: { index: false, follow: false },
};

export default function StaffLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-raised px-5">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-bg p-8">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="mt-6 text-center text-xl font-extrabold text-ink">Staff login</h1>
        <p className="mt-1 text-center text-sm text-ink-muted">Internal access only.</p>
        <div className="mt-6">
          <LoginForm kind="staff" redirectTo="/staff" />
        </div>
      </div>
    </div>
  );
}
