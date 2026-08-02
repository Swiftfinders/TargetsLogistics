"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { PortalHeader } from "@/components/portal/portal-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { publicEnv } from "@/lib/public-env";
import { REQUEST_STATUS_LABELS, SERVICE_TIER_LABELS, formatNeededBy } from "@/lib/shipment-request-format";
import type { SessionUser } from "@/lib/use-session";

interface StaffShipmentRequestRow {
  id: string;
  pickupAddress: string;
  dropoffAddress: string;
  description: string;
  neededBy: string;
  serviceTier: string;
  status: string;
  account: { name: string };
}

interface StaffSignupRow {
  id: string;
  email: string;
  name: string;
  accountName: string | null;
  createdAt: string;
}

function StaffSignupsList() {
  const { publish } = useToast();
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
  const [items, setItems] = useState<StaffSignupRow[]>([]);
  const [workingId, setWorkingId] = useState<string | null>(null);

  function load() {
    setState("loading");
    fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/staff/signups`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("failed"))))
      .then((body) => {
        setItems(body.items);
        setState("loaded");
      })
      .catch(() => setState("error"));
  }

  useEffect(load, []);

  async function review(id: string, action: "approve" | "reject") {
    setWorkingId(id);
    const response = await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/staff/signups/${id}/${action}`, {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      setItems((current) => current.filter((item) => item.id !== id));
      publish({
        title: action === "approve" ? "Signup approved" : "Signup rejected",
        ...(action === "approve" ? { description: "An invite email with a set-password link was sent." } : {}),
      });
    } else {
      publish({ title: "Something went wrong", description: "Please try again." });
    }
    setWorkingId(null);
  }

  if (state === "loading") return null;
  if (state === "error") {
    return (
      <p className="rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm text-accent">
        Couldn&apos;t load pending signups. Please refresh the page.
      </p>
    );
  }
  if (items.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="text-lg font-extrabold text-ink">Pending signups</h2>
      <p className="mt-1 text-sm text-ink-muted">New client accounts waiting for approval.</p>
      <div className="mt-4">
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
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={workingId === item.id}
                      onClick={() => review(item.id, "reject")}
                    >
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function statusTone(status: string): "neutral" | "confirm" | "accent" {
  if (status === "CLOSED") return "confirm";
  if (status === "NEW") return "accent";
  return "neutral";
}

function StaffRequestsList() {
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
  const [items, setItems] = useState<StaffShipmentRequestRow[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function load() {
    setState("loading");
    fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/staff/requests`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("failed"))))
      .then((body) => {
        setItems(body.items);
        setState("loaded");
      })
      .catch(() => setState("error"));
  }

  useEffect(load, []);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    const previous = items;
    setItems((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));

    const response = await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/staff/requests/${id}/status`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) setItems(previous);
    setUpdatingId(null);
  }

  return (
    <div className="mx-auto max-w-6xl px-5 pb-10">
      <h1 className="text-2xl font-extrabold text-ink">All client requests</h1>
      <p className="mt-1 text-sm text-ink-muted">Across every account.</p>

      <div className="mt-8">
        {state === "loading" && <p className="text-sm text-ink-muted">Loading requests…</p>}
        {state === "error" && (
          <p className="rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm text-accent">
            Couldn&apos;t load requests. Please refresh the page.
          </p>
        )}
        {state === "loaded" && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line p-10 text-center">
            <p className="text-sm text-ink-muted">No client requests yet.</p>
          </div>
        )}
        {state === "loaded" && items.length > 0 && (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Account</TableHeaderCell>
                <TableHeaderCell>Pickup</TableHeaderCell>
                <TableHeaderCell>Dropoff</TableHeaderCell>
                <TableHeaderCell>Service</TableHeaderCell>
                <TableHeaderCell>Needed by</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.account.name}</TableCell>
                  <TableCell>{item.pickupAddress}</TableCell>
                  <TableCell>{item.dropoffAddress}</TableCell>
                  <TableCell>{SERVICE_TIER_LABELS[item.serviceTier] ?? item.serviceTier}</TableCell>
                  <TableCell>{formatNeededBy(item.neededBy)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge tone={statusTone(item.status)}>{REQUEST_STATUS_LABELS[item.status] ?? item.status}</Badge>
                      <Select
                        aria-label={`Update status for request to ${item.dropoffAddress}`}
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
        )}
      </div>
    </div>
  );
}

export default function StaffDashboardPage() {
  return (
    <AuthGuard kind="staff" loginPath="/staff/login">
      {(user: SessionUser) => (
        <div className="min-h-screen bg-bg">
          <PortalHeader user={user} homeHref="/staff" />
          <div className="mx-auto max-w-6xl px-5 pt-10">
            <StaffSignupsList />
          </div>
          <StaffRequestsList />
        </div>
      )}
    </AuthGuard>
  );
}
