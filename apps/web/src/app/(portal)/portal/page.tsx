"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SERVICE_LEVEL_DETAILS, type ServiceLevel } from "@targets/shared";
import { AuthGuard } from "@/components/auth-guard";
import { PortalHeader } from "@/components/portal/portal-header";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { publicEnv } from "@/lib/public-env";
import { REQUEST_STATUS_LABELS } from "@/lib/shipment-request-format";
import type { SessionUser } from "@/lib/use-session";

interface OrderRow {
  id: string;
  reference: string;
  pickupAddress: string;
  deliveryAddress: string;
  serviceLevel: string;
  estimatedPriceCents: number;
  status: string;
  createdAt: string;
}

const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const serviceLabel = (level: string) => SERVICE_LEVEL_DETAILS[level as ServiceLevel]?.label ?? level;

function statusTone(status: string): "neutral" | "confirm" | "accent" {
  if (status === "CLOSED") return "confirm";
  if (status === "NEW") return "accent";
  return "neutral";
}

function OrdersList({ user }: { user: SessionUser }) {
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
  const [items, setItems] = useState<OrderRow[]>([]);

  useEffect(() => {
    fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/portal/orders`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("failed"))))
      .then((body) => {
        setItems(body.items);
        setState("loaded");
      })
      .catch(() => setState("error"));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Your orders</h1>
          <p className="mt-1 text-sm text-ink-muted">Signed in as {user.name}</p>
        </div>
        <Link href="/portal/new" className={buttonClasses("primary", "md")}>
          New order
        </Link>
      </div>

      <div className="mt-8">
        {state === "loading" && <p className="text-sm text-ink-muted">Loading your orders…</p>}
        {state === "error" && (
          <p className="rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm text-accent">
            Couldn&apos;t load your orders. Please refresh the page.
          </p>
        )}
        {state === "loaded" && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line p-10 text-center">
            <p className="text-sm text-ink-muted">No orders yet.</p>
            <Link href="/portal/new" className={buttonClasses("primary", "sm", "mt-4")}>
              Submit your first order
            </Link>
          </div>
        )}
        {state === "loaded" && items.length > 0 && (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Reference</TableHeaderCell>
                <TableHeaderCell>Pickup</TableHeaderCell>
                <TableHeaderCell>Delivery</TableHeaderCell>
                <TableHeaderCell>Service</TableHeaderCell>
                <TableHeaderCell>Estimate</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">{item.reference}</TableCell>
                  <TableCell>{item.pickupAddress}</TableCell>
                  <TableCell>{item.deliveryAddress}</TableCell>
                  <TableCell>{serviceLabel(item.serviceLevel)}</TableCell>
                  <TableCell>{formatPrice(item.estimatedPriceCents)}</TableCell>
                  <TableCell>
                    <Badge tone={statusTone(item.status)}>{REQUEST_STATUS_LABELS[item.status] ?? item.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

export default function PortalDashboardPage() {
  return (
    <AuthGuard kind="client" loginPath="/portal/login">
      {(user) => (
        <div className="min-h-screen bg-bg">
          <PortalHeader user={user} homeHref="/portal" />
          <OrdersList user={user} />
        </div>
      )}
    </AuthGuard>
  );
}
