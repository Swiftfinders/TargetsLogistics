"use client";

import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Link from "next/link";
import {
  PACKAGE_TYPE_DETAILS,
  SERVICE_LEVEL_DETAILS,
  VEHICLE_DETAILS,
  estimateOrderPriceCents,
  generateOrderReference,
  type PackageType,
  type ServiceLevel,
  type VehicleType,
} from "@targets/shared";
import { FieldError, Input, Label, Textarea } from "@/components/ui/input";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { publicEnv } from "@/lib/public-env";

/* Brand colours from the Target Logistic rate card (navy + red), kept local to
   this form so it matches the printed collateral rather than the site accent. */
const NAVY = "#16294f";
const RED = "#c1122e";

const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

const PACKAGE_OPTIONS = (Object.keys(PACKAGE_TYPE_DETAILS) as PackageType[]).map((value) => ({
  value,
  label: PACKAGE_TYPE_DETAILS[value].label,
}));
const VEHICLE_OPTIONS = (Object.keys(VEHICLE_DETAILS) as VehicleType[]).map((value) => ({
  value,
  label: VEHICLE_DETAILS[value].label,
}));
const SERVICE_OPTIONS = (Object.keys(SERVICE_LEVEL_DETAILS) as ServiceLevel[]).map((value) => ({
  value,
  label: SERVICE_LEVEL_DETAILS[value].label,
}));

interface FormValues {
  pickupContactName: string;
  pickupCompany: string;
  pickupPhone: string;
  pickupAddress: string;
  deliveryContactName: string;
  deliveryCompany: string;
  deliveryPhone: string;
  deliveryAddress: string;
  packageType: PackageType;
  pieces: string;
  weightKg: string;
  dimensions: string;
  contents: string;
  vehicleType: VehicleType | "";
  serviceLevel: ServiceLevel;
  pickupDate: string;
  pickupTime: string;
  specialInstructions: string;
}

const initialValues: FormValues = {
  pickupContactName: "",
  pickupCompany: "",
  pickupPhone: "",
  pickupAddress: "",
  deliveryContactName: "",
  deliveryCompany: "",
  deliveryPhone: "",
  deliveryAddress: "",
  packageType: "ENVELOPE",
  pieces: "",
  weightKg: "",
  dimensions: "",
  contents: "",
  vehicleType: "",
  serviceLevel: "SAME_DAY",
  pickupDate: "",
  pickupTime: "",
  specialInstructions: "",
};

type FieldErrors = Partial<Record<"pickupAddress" | "deliveryAddress", string>>;

function SectionHeader({ num, title }: { num: string; title: string }) {
  return (
    <div className="mb-5 border-b-2 pb-2" style={{ borderColor: NAVY }}>
      <h2 className="text-lg font-extrabold tracking-tight" style={{ color: NAVY }}>
        <span className="mr-2 font-mono" style={{ color: RED }}>
          {num}
        </span>
        {title}
      </h2>
    </div>
  );
}

function SectionCard({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-line bg-bg p-5 sm:p-6">{children}</div>;
}

function PillGroup<T extends string>({
  label,
  required,
  options,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  options: { value: T; label: string }[];
  value: T | "";
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label}>
      <Label>
        {label}
        {required && <span style={{ color: RED }}> *</span>}
      </Label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(opt.value)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)",
                selected ? "border-transparent text-white" : "border-line bg-bg text-ink hover:bg-bg-raised",
              )}
              style={selected ? { backgroundColor: NAVY } : undefined}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function OrderForm({ mode }: { mode: "public" | "client" }) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [reference, setReference] = useState("");
  const [done, setDone] = useState<{ reference: string; estimatedPriceCents: number } | null>(null);

  // Generated after mount to avoid a hydration mismatch (Math.random differs
  // between the server render and the client). Re-checked for uniqueness by the API.
  useEffect(() => setReference(generateOrderReference()), []);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const estimate = estimateOrderPriceCents({
    vehicleType: values.vehicleType || undefined,
    weightKg: values.weightKg ? Number(values.weightKg) : undefined,
    serviceLevel: values.serviceLevel,
    pickupDate: values.pickupDate || undefined,
    pickupTime: values.pickupTime || undefined,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(undefined);

    const nextErrors: FieldErrors = {};
    if (!values.pickupAddress.trim()) nextErrors.pickupAddress = "Enter a pickup address";
    if (!values.deliveryAddress.trim()) nextErrors.deliveryAddress = "Enter a delivery address";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setStatus("submitting");

    const endpoint = mode === "client" ? "/portal/orders" : "/orders";
    const v = values;
    try {
      const response = await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: "POST",
        ...(mode === "client" ? { credentials: "include" as const } : {}),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: reference || undefined,
          pickupContactName: v.pickupContactName.trim() || undefined,
          pickupCompany: v.pickupCompany.trim() || undefined,
          pickupPhone: v.pickupPhone.trim() || undefined,
          pickupAddress: v.pickupAddress.trim(),
          deliveryContactName: v.deliveryContactName.trim() || undefined,
          deliveryCompany: v.deliveryCompany.trim() || undefined,
          deliveryPhone: v.deliveryPhone.trim() || undefined,
          deliveryAddress: v.deliveryAddress.trim(),
          packageType: v.packageType,
          pieces: v.pieces ? Number(v.pieces) : undefined,
          weightKg: v.weightKg ? Number(v.weightKg) : undefined,
          dimensions: v.dimensions.trim() || undefined,
          contents: v.contents.trim() || undefined,
          vehicleType: v.vehicleType || undefined,
          serviceLevel: v.serviceLevel,
          pickupDate: v.pickupDate || undefined,
          pickupTime: v.pickupTime || undefined,
          specialInstructions: v.specialInstructions.trim() || undefined,
        }),
      });

      if (!response.ok) throw new Error(`API responded ${response.status}`);
      const payload = (await response.json()) as { reference: string; estimatedPriceCents: number };
      setDone({ reference: payload.reference, estimatedPriceCents: payload.estimatedPriceCents });
    } catch {
      setSubmitError("Something went wrong sending your order. Please try again in a moment.");
      setStatus("idle");
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-confirm/40 bg-confirm-bg p-6">
        <p className="text-lg font-extrabold" style={{ color: NAVY }}>
          Order received — {done.reference}
        </p>
        <p className="mt-2 text-sm text-ink">
          Estimated price: <span className="font-bold">{formatPrice(done.estimatedPriceCents)}</span>. Our dispatch team
          will follow up shortly to confirm distance, timing and the final price.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={mode === "client" ? "/portal" : "/"} className={buttonClasses("outline", "md")}>
            {mode === "client" ? "Back to dashboard" : "Back to home"}
          </Link>
          <button
            type="button"
            className={buttonClasses("outline", "md")}
            onClick={() => {
              setValues(initialValues);
              setReference(generateOrderReference());
              setDone(null);
              setStatus("idle");
            }}
          >
            Submit another order
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <div
        className="flex items-center justify-between rounded-lg px-5 py-3"
        style={{ backgroundColor: NAVY }}
      >
        <span className="text-xs font-bold uppercase tracking-widest text-white/75">Order Reference</span>
        <span className="font-mono text-sm font-bold" style={{ color: "#f2777c" }}>
          {reference || "…"}
        </span>
      </div>

      {/* 01 Pickup Location */}
      <SectionCard>
        <SectionHeader num="01" title="Pickup Location" />
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="pickupContactName">Pickup Contact Name</Label>
              <Input
                id="pickupContactName"
                value={values.pickupContactName}
                onChange={(e) => set("pickupContactName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="pickupCompany">Pickup Company</Label>
              <Input id="pickupCompany" value={values.pickupCompany} onChange={(e) => set("pickupCompany", e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="pickupPhone">Pickup Phone</Label>
            <Input id="pickupPhone" type="tel" value={values.pickupPhone} onChange={(e) => set("pickupPhone", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="pickupAddress">
              Pickup Address <span style={{ color: RED }}>*</span>
            </Label>
            <Textarea
              id="pickupAddress"
              rows={2}
              placeholder="Street address, unit, city, postal code"
              value={values.pickupAddress}
              onChange={(e) => set("pickupAddress", e.target.value)}
              aria-invalid={Boolean(errors.pickupAddress)}
              aria-describedby={errors.pickupAddress ? "pickupAddress-error" : undefined}
            />
            <FieldError id="pickupAddress-error">{errors.pickupAddress}</FieldError>
          </div>
        </div>
      </SectionCard>

      {/* 02 Delivery Location */}
      <SectionCard>
        <SectionHeader num="02" title="Delivery Location" />
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="deliveryContactName">Delivery Contact Name</Label>
              <Input
                id="deliveryContactName"
                value={values.deliveryContactName}
                onChange={(e) => set("deliveryContactName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="deliveryCompany">Delivery Company</Label>
              <Input
                id="deliveryCompany"
                value={values.deliveryCompany}
                onChange={(e) => set("deliveryCompany", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="deliveryPhone">Delivery Phone</Label>
            <Input
              id="deliveryPhone"
              type="tel"
              value={values.deliveryPhone}
              onChange={(e) => set("deliveryPhone", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="deliveryAddress">
              Delivery Address <span style={{ color: RED }}>*</span>
            </Label>
            <Textarea
              id="deliveryAddress"
              rows={2}
              placeholder="Street address, unit, city, postal code"
              value={values.deliveryAddress}
              onChange={(e) => set("deliveryAddress", e.target.value)}
              aria-invalid={Boolean(errors.deliveryAddress)}
              aria-describedby={errors.deliveryAddress ? "deliveryAddress-error" : undefined}
            />
            <FieldError id="deliveryAddress-error">{errors.deliveryAddress}</FieldError>
          </div>
        </div>
      </SectionCard>

      {/* 03 Shipment Details */}
      <SectionCard>
        <SectionHeader num="03" title="Shipment Details" />
        <div className="space-y-5">
          <PillGroup
            label="Package Type"
            options={PACKAGE_OPTIONS}
            value={values.packageType}
            onChange={(value) => set("packageType", value)}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="pieces"># of Packages</Label>
              <Input
                id="pieces"
                type="number"
                min="1"
                value={values.pieces}
                onChange={(e) => set("pieces", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="weightKg">Total Weight (kg)</Label>
              <Input
                id="weightKg"
                type="number"
                min="0"
                step="0.1"
                value={values.weightKg}
                onChange={(e) => set("weightKg", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="dimensions">Dimensions (L × W × H)</Label>
            <Input
              id="dimensions"
              placeholder="e.g. 120 × 80 × 100 cm"
              value={values.dimensions}
              onChange={(e) => set("dimensions", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="contents">Contents</Label>
            <Input id="contents" value={values.contents} onChange={(e) => set("contents", e.target.value)} />
          </div>
          <PillGroup
            label="Vehicle Type"
            options={VEHICLE_OPTIONS}
            value={values.vehicleType}
            onChange={(value) => set("vehicleType", value)}
          />
        </div>
      </SectionCard>

      {/* 04 Service Requested */}
      <SectionCard>
        <SectionHeader num="04" title="Service Requested" />
        <div className="space-y-5">
          <PillGroup
            label="Service Level"
            required
            options={SERVICE_OPTIONS}
            value={values.serviceLevel}
            onChange={(value) => set("serviceLevel", value)}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="pickupDate">Requested Pickup Date</Label>
              <Input
                id="pickupDate"
                type="date"
                value={values.pickupDate}
                onChange={(e) => set("pickupDate", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="pickupTime">Requested Pickup Time</Label>
              <Input
                id="pickupTime"
                type="time"
                value={values.pickupTime}
                onChange={(e) => set("pickupTime", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea
              id="specialInstructions"
              rows={3}
              placeholder="Dock/door info, access codes, fragile items, etc."
              value={values.specialInstructions}
              onChange={(e) => set("specialInstructions", e.target.value)}
            />
          </div>
        </div>
      </SectionCard>

      <div className="rounded-2xl border border-line bg-bg-raised px-5 py-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Estimated Price</span>
        <div className="mt-1 text-3xl font-extrabold" style={{ color: NAVY }}>
          {formatPrice(estimate)}
        </div>
        {estimate === 0 && <p className="mt-1 text-xs text-ink-muted">Select a vehicle type to see your estimate.</p>}
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          Base rate covers up to 10&nbsp;km. Distance beyond 10&nbsp;km and after-hours charges are confirmed by our team
          after you submit.
        </p>
      </div>

      {submitError && <p className="text-sm font-medium text-accent">{submitError}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full px-6 py-4 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)"
        style={{ backgroundColor: RED }}
      >
        {status === "submitting" ? "Sending…" : "Send order to dispatch"}
      </button>
    </form>
  );
}
