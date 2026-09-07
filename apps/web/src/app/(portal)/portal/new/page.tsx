"use client";

import { AuthGuard } from "@/components/auth-guard";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PortalHeader } from "@/components/portal/portal-header";
import { OrderForm } from "@/components/order-form";

export default function NewRequestPage() {
  return (
    <AuthGuard kind="client" loginPath="/portal/login">
      {(user) => (
        <div className="min-h-screen bg-bg">
          <PortalHeader user={user} homeHref="/portal" />
          <div className="mx-auto max-w-2xl px-5 py-10">
            <Breadcrumb items={[{ label: "Orders", href: "/portal" }, { label: "New order" }]} />
            <h1 className="mt-4 text-2xl font-extrabold text-ink">New delivery order</h1>
            <p className="mt-1 text-sm text-ink-muted">We&apos;ll follow up to confirm timing and the final price.</p>
            <div className="mt-8">
              <OrderForm mode="client" />
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
