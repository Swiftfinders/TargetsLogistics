"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { publicEnv } from "@/lib/public-env";

const initialValues = {
  pickupAddress: "",
  dropoffAddress: "",
  description: "",
  neededBy: "",
  serviceTier: "SAME_DAY",
  pieces: "",
  weightKg: "",
};

function validate(values: typeof initialValues) {
  const errors: Partial<Record<keyof typeof initialValues, string>> = {};
  if (!values.pickupAddress.trim()) errors.pickupAddress = "Enter a pickup address";
  if (!values.dropoffAddress.trim()) errors.dropoffAddress = "Enter a dropoff address";
  if (!values.description.trim()) errors.description = "Describe what's being shipped";
  if (!values.neededBy) errors.neededBy = "Choose a date and time";
  return errors;
}

export function NewRequestForm() {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof initialValues, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [submitError, setSubmitError] = useState<string | undefined>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(undefined);

    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const response = await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/portal/requests`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupAddress: values.pickupAddress.trim(),
          dropoffAddress: values.dropoffAddress.trim(),
          description: values.description.trim(),
          neededBy: new Date(values.neededBy).toISOString(),
          serviceTier: values.serviceTier,
          pieces: values.pieces ? Number(values.pieces) : undefined,
          weightKg: values.weightKg ? Number(values.weightKg) : undefined,
        }),
      });

      if (!response.ok) throw new Error(`API responded ${response.status}`);

      router.push("/portal");
      router.refresh();
    } catch {
      setSubmitError("Something went wrong submitting your request. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="pickupAddress">Pickup address</Label>
          <Input
            id="pickupAddress"
            value={values.pickupAddress}
            onChange={(e) => setValues((v) => ({ ...v, pickupAddress: e.target.value }))}
            aria-invalid={Boolean(errors.pickupAddress)}
            aria-describedby={errors.pickupAddress ? "pickupAddress-error" : undefined}
          />
          <FieldError id="pickupAddress-error">{errors.pickupAddress}</FieldError>
        </div>
        <div>
          <Label htmlFor="dropoffAddress">Dropoff address</Label>
          <Input
            id="dropoffAddress"
            value={values.dropoffAddress}
            onChange={(e) => setValues((v) => ({ ...v, dropoffAddress: e.target.value }))}
            aria-invalid={Boolean(errors.dropoffAddress)}
            aria-describedby={errors.dropoffAddress ? "dropoffAddress-error" : undefined}
          />
          <FieldError id="dropoffAddress-error">{errors.dropoffAddress}</FieldError>
        </div>
      </div>

      <div>
        <Label htmlFor="description">What&apos;s being shipped</Label>
        <Textarea
          id="description"
          value={values.description}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? "description-error" : undefined}
        />
        <FieldError id="description-error">{errors.description}</FieldError>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="neededBy">Needed by</Label>
          <Input
            id="neededBy"
            type="datetime-local"
            value={values.neededBy}
            onChange={(e) => setValues((v) => ({ ...v, neededBy: e.target.value }))}
            aria-invalid={Boolean(errors.neededBy)}
            aria-describedby={errors.neededBy ? "neededBy-error" : undefined}
          />
          <FieldError id="neededBy-error">{errors.neededBy}</FieldError>
        </div>
        <div>
          <Label htmlFor="serviceTier">Service tier</Label>
          <Select
            id="serviceTier"
            value={values.serviceTier}
            onChange={(e) => setValues((v) => ({ ...v, serviceTier: e.target.value }))}
          >
            <option value="SAME_DAY">Same Day</option>
            <option value="RUSH">Rush</option>
            <option value="OVERNIGHT">Overnight</option>
            <option value="SCHEDULED">Scheduled</option>
          </Select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="pieces">Pieces (optional)</Label>
          <Input
            id="pieces"
            type="number"
            min="1"
            value={values.pieces}
            onChange={(e) => setValues((v) => ({ ...v, pieces: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="weightKg">Approx. weight, kg (optional)</Label>
          <Input
            id="weightKg"
            type="number"
            min="0"
            step="0.1"
            value={values.weightKg}
            onChange={(e) => setValues((v) => ({ ...v, weightKg: e.target.value }))}
          />
        </div>
      </div>

      {submitError && <p className="text-sm font-medium text-accent">{submitError}</p>}

      <Button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Submitting…" : "Submit request"}
      </Button>
    </form>
  );
}
