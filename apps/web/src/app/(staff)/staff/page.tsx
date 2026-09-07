"use client";

import { useCallback, useEffect, useState } from "react";
import { SERVICE_LEVEL_DETAILS, VEHICLE_DETAILS, type ServiceLevel, type VehicleType } from "@targets/shared";
import { AuthGuard } from "@/components/auth-guard";
import { PortalHeader } from "@/components/portal/portal-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { publicEnv } from "@/lib/public-env";
import { REQUEST_STATUS_LABELS } from "@/lib/shipment-request-format";
import type { SessionUser } from "@/lib/use-session";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface Analytics {
  totalClients: number;
  pendingSignups: number;
  newOrders: number;
  totalOrders: number;
  acknowledgedOrders: number;
  closedOrders: number;
  totalClientUsers: number;
}

interface OrderRow {
  id: string;
  reference: string;
  pickupCompany: string | null;
  pickupAddress: string;
  deliveryAddress: string;
  vehicleType: string | null;
  serviceLevel: string;
  estimatedPriceCents: number;
  status: string;
  createdAt: string;
  account: { name: string } | null;
}

interface SignupRow {
  id: string;
  email: string;
  name: string;
  accountName: string | null;
  createdAt: string;
}

interface ClientAccountRow {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  users: { id: string; name: string; email: string; status: string }[];
  _count: { orders: number };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const API = publicEnv.NEXT_PUBLIC_API_URL;
const SERVICE_CITIES = ["Kitchener", "Waterloo", "Cambridge"];

const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const serviceLabel = (level: string) => SERVICE_LEVEL_DETAILS[level as ServiceLevel]?.label ?? level;
const vehicleLabel = (v: string | null) => (v ? (VEHICLE_DETAILS[v as VehicleType]?.label ?? v) : "—");

function statusTone(status: string): "neutral" | "confirm" | "accent" {
  if (status === "CLOSED") return "confirm";
  if (status === "NEW") return "accent";
  return "neutral";
}

function userStatusTone(status: string): "neutral" | "confirm" | "accent" {
  if (status === "ACTIVE") return "confirm";
  if (status === "PENDING") return "accent";
  return "neutral";
}

function userStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: "Active",
    PENDING: "Pending",
    INVITED: "Invited",
    SUSPENDED: "Suspended",
  };
  return labels[status] ?? status;
}

/* ------------------------------------------------------------------ */
/*  Stat Cards                                                        */
/* ------------------------------------------------------------------ */

function StatCard({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <Card className="flex flex-col gap-1 p-5">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</span>
      <span className={`text-2xl font-extrabold ${accent ? "text-accent" : "text-ink"}`}>{value}</span>
    </Card>
  );
}

function StatsOverview({ analytics }: { analytics: Analytics | null }) {
  if (!analytics) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-[76px] animate-pulse p-5" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="Client accounts" value={analytics.totalClients} />
      <StatCard label="Pending signups" value={analytics.pendingSignups} accent={analytics.pendingSignups > 0} />
      <StatCard label="New orders" value={analytics.newOrders} accent={analytics.newOrders > 0} />
      <StatCard label="Total orders" value={analytics.totalOrders} />
    </div>
  );
}

function OrderBreakdown({ analytics }: { analytics: Analytics | null }) {
  if (!analytics || analytics.totalOrders === 0) return null;

  return (
    <Card className="p-5">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Order breakdown</span>
      <div className="mt-3 flex gap-6">
        <div className="flex items-center gap-2">
          <Badge tone="accent">New</Badge>
          <span className="text-sm font-semibold text-ink">{analytics.newOrders}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="neutral">Acknowledged</Badge>
          <span className="text-sm font-semibold text-ink">{analytics.acknowledgedOrders}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="confirm">Closed</Badge>
          <span className="text-sm font-semibold text-ink">{analytics.closedOrders}</span>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Orders Tab                                                        */
/* ------------------------------------------------------------------ */

function OrdersTab() {
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
  const [items, setItems] = useState<OrderRow[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/staff/orders`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("failed"))))
      .then((body) => { setItems(body.items); setState("loaded"); })
      .catch(() => setState("error"));
  }, []);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    const previous = items;
    setItems((cur) => cur.map((r) => (r.id === id ? { ...r, status } : r)));
    const res = await fetch(`${API}/staff/orders/${id}/status`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) setItems(previous);
    setUpdatingId(null);
  }

  if (state === "loading") return <p className="text-sm text-ink-muted">Loading orders…</p>;
  if (state === "error") {
    return (
      <p className="rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm text-accent">
        Couldn&apos;t load orders. Please refresh the page.
      </p>
    );
  }
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-10 text-center">
        <p className="text-sm text-ink-muted">No orders yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Reference</TableHeaderCell>
            <TableHeaderCell>Customer</TableHeaderCell>
            <TableHeaderCell>Pickup</TableHeaderCell>
            <TableHeaderCell>Delivery</TableHeaderCell>
            <TableHeaderCell>Vehicle</TableHeaderCell>
            <TableHeaderCell>Service</TableHeaderCell>
            <TableHeaderCell>Estimate</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-mono text-xs">{item.reference}</TableCell>
              <TableCell className="font-medium">{item.account?.name ?? item.pickupCompany ?? "Public"}</TableCell>
              <TableCell>{item.pickupAddress}</TableCell>
              <TableCell>{item.deliveryAddress}</TableCell>
              <TableCell>{vehicleLabel(item.vehicleType)}</TableCell>
              <TableCell>{serviceLabel(item.serviceLevel)}</TableCell>
              <TableCell>{formatPrice(item.estimatedPriceCents)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge tone={statusTone(item.status)}>{REQUEST_STATUS_LABELS[item.status] ?? item.status}</Badge>
                  <Select
                    aria-label={`Update status for order ${item.reference}`}
                    value={item.status}
                    disabled={updatingId === item.id}
                    onChange={(e) => updateStatus(item.id, e.target.value)}
                    className="w-auto py-1 text-xs"
                  >
                    <option value="NEW">New</option>
                    <option value="ACKNOWLEDGED">Acknowledged</option>
                    <option value="CLOSED">Closed</option>
                  </Select>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Clients Tab                                                       */
/* ------------------------------------------------------------------ */

function ClientsTab() {
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
  const [items, setItems] = useState<ClientAccountRow[]>([]);

  useEffect(() => {
    fetch(`${API}/staff/clients`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("failed"))))
      .then((body) => { setItems(body.items); setState("loaded"); })
      .catch(() => setState("error"));
  }, []);

  if (state === "loading") return <p className="text-sm text-ink-muted">Loading clients…</p>;
  if (state === "error") {
    return (
      <p className="rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm text-accent">
        Couldn&apos;t load clients. Please refresh the page.
      </p>
    );
  }
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-10 text-center">
        <p className="text-sm text-ink-muted">No client accounts yet.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Company</TableHeaderCell>
          <TableHeaderCell>Contact</TableHeaderCell>
          <TableHeaderCell>Email</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Orders</TableHeaderCell>
          <TableHeaderCell>Created</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((account) => {
          const primary = account.users[0];
          return (
            <TableRow key={account.id}>
              <TableCell className="font-medium">{account.name}</TableCell>
              <TableCell>{primary?.name ?? "—"}</TableCell>
              <TableCell>{primary?.email ?? "—"}</TableCell>
              <TableCell>
                <Badge tone={primary ? userStatusTone(primary.status) : "neutral"}>
                  {primary ? userStatusLabel(primary.status) : "—"}
                </Badge>
              </TableCell>
              <TableCell>{account._count.orders}</TableCell>
              <TableCell>{new Date(account.createdAt).toLocaleDateString()}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

/* ------------------------------------------------------------------ */
/*  Signups Tab                                                       */
/* ------------------------------------------------------------------ */

function SignupsTab({ onCountChange }: { onCountChange: (count: number) => void }) {
  const { publish } = useToast();
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
  const [items, setItems] = useState<SignupRow[]>([]);
  const [workingId, setWorkingId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/staff/signups`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("failed"))))
      .then((body) => { setItems(body.items); onCountChange(body.items.length); setState("loaded"); })
      .catch(() => setState("error"));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function review(id: string, action: "approve" | "reject") {
    setWorkingId(id);
    const res = await fetch(`${API}/staff/signups/${id}/${action}`, {
      method: "POST",
      credentials: "include",
    });

    if (res.ok) {
      const next = items.filter((item) => item.id !== id);
      setItems(next);
      onCountChange(next.length);
      publish({
        title: action === "approve" ? "Signup approved" : "Signup rejected",
        ...(action === "approve" ? { description: "The client can now sign in with the password they chose." } : {}),
      });
    } else {
      publish({ title: "Something went wrong", description: "Please try again." });
    }
    setWorkingId(null);
  }

  if (state === "loading") return <p className="text-sm text-ink-muted">Loading signups…</p>;
  if (state === "error") {
    return (
      <p className="rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm text-accent">
        Couldn&apos;t load pending signups. Please refresh the page.
      </p>
    );
  }
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-10 text-center">
        <p className="text-sm text-ink-muted">No pending signups.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Company</TableHeaderCell>
          <TableHeaderCell>Contact</TableHeaderCell>
          <TableHeaderCell>Email</TableHeaderCell>
          <TableHeaderCell>Requested</TableHeaderCell>
          <TableHeaderCell>Action</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.accountName ?? "—"}</TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.email}</TableCell>
            <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button size="sm" disabled={workingId === item.id} onClick={() => review(item.id, "approve")}>
                  Approve
                </Button>
                <Button size="sm" variant="outline" disabled={workingId === item.id} onClick={() => review(item.id, "reject")}>
                  Reject
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/* ------------------------------------------------------------------ */
/*  Service Area                                                      */
/* ------------------------------------------------------------------ */

function ServiceArea() {
  return (
    <Card className="p-5">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Service area</span>
      <div className="mt-3 flex flex-wrap gap-2">
        {SERVICE_CITIES.map((city) => (
          <span
            key={city}
            className="inline-flex items-center gap-1.5 rounded-full bg-bg-sunken px-3 py-1 text-sm font-medium text-ink"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4 text-confirm" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 1 1 9.9 9.9L10 18.9l-4.95-4.95a7 7 0 0 1 0-9.9ZM10 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
                clipRule="evenodd"
              />
            </svg>
            {city}
          </span>
        ))}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard Shell                                                   */
/* ------------------------------------------------------------------ */

function DashboardContent({ user }: { user: SessionUser }) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [signupCount, setSignupCount] = useState(0);

  useEffect(() => {
    fetch(`${API}/staff/analytics`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("failed"))))
      .then(setAnalytics)
      .catch(() => {});
  }, []);

  const handleSignupCountChange = useCallback((count: number) => {
    setSignupCount(count);
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <PortalHeader user={user} homeHref="/staff" />

      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-muted">Welcome back, {user.name}.</p>
        </div>

        <div className="space-y-4">
          <StatsOverview analytics={analytics} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <OrderBreakdown analytics={analytics} />
            <ServiceArea />
          </div>
        </div>

        <div className="mt-10">
          <Tabs defaultValue="orders">
            <TabsList className="flex-wrap">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="signups">
                Signups{signupCount > 0 && (
                  <span className="ml-1.5 inline-flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-ink">
                    {signupCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <OrdersTab />
            </TabsContent>
            <TabsContent value="clients">
              <ClientsTab />
            </TabsContent>
            <TabsContent value="signups">
              <SignupsTab onCountChange={handleSignupCountChange} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default function StaffDashboardPage() {
  return (
    <AuthGuard kind="staff" loginPath="/staff/login">
      {(user: SessionUser) => <DashboardContent user={user} />}
    </AuthGuard>
  );
}
