"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { PortalHeader } from "@/components/portal/portal-header";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { publicEnv } from "@/lib/public-env";
import { LOAD_SIZE_LABELS, REQUEST_STATUS_LABELS, SERVICE_TIER_LABELS, formatNeededBy } from "@/lib/shipment-request-format";
import type { SessionUser } from "@/lib/use-session";

interface ShipmentRequestRow {
  id: string;
  pickupAddress: string;
  dropoffAddress: string;
  description: string;
  neededBy: string;
  serviceTier: string;
  loadSize: string;
  status: string;
  createdAt: string;
}

function statusTone(status: string): "neutral" | "confirm" | "accent" {
  if (status === "CLOSED") return "confirm";
  if (status === "NEW") return "accent";
  return "neutral";
}

function RequestsList({ user }: { user: SessionUser }) {
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
  const [items, setItems] = useState<ShipmentRequestRow[]>([]);

  useEffect(() => {
    fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/portal/requests`, { credentials: "include" })
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
          <h1 className="text-2xl font-extrabold text-ink">Your requests</h1>
          <p className="mt-1 text-sm text-ink-muted">Signed in as {user.name}</p>
        </div>
        <Link href="/portal/new" className={buttonClasses("primary", "md")}>
          New request
        </Link>
      </div>

      <div className="mt-8">
        {state === "loading" && <p className="text-sm text-ink-muted">Loading your requests…</p>}
        {state === "error" && (
          <p className="rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm text-accent">
            Couldn&apos;t load your requests. Please refresh the page.
          </p>
        )}
        {state === "loaded" && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line p-10 text-center">
            <p className="text-sm text-ink-muted">No requests yet.</p>
            <Link href="/portal/new" className={buttonClasses("primary", "sm", "mt-4")}>
              Submit your first request
            </Link>
          </div>
        )}
        {state === "loaded" && items.length > 0 && (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Pickup</TableHeaderCell>
                <TableHeaderCell>Dropoff</TableHeaderCell>
                <TableHeaderCell>Service</TableHeaderCell>
                <TableHeaderCell>Load size</TableHeaderCell>
                <TableHeaderCell>Needed by</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.pickupAddress}</TableCell>
                  <TableCell>{item.dropoffAddress}</TableCell>
                  <TableCell>{SERVICE_TIER_LABELS[item.serviceTier] ?? item.serviceTier}</TableCell>
                  <TableCell>{LOAD_SIZE_LABELS[item.loadSize] ?? item.loadSize}</TableCell>
                  <TableCell>{formatNeededBy(item.neededBy)}</TableCell>
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
          <RequestsList user={user} />
        </div>
      )}
    </AuthGuard>
  );
}
