"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { publicEnv } from "@/lib/public-env";

type FieldErrors = Partial<Record<"name" | "email" | "phone" | "company" | "message", string>>;

const initialValues = { name: "", email: "", phone: "", company: "", message: "" };

/**
 * Validates just enough client-side for immediate feedback. The API's Zod schema
 * is the actual source of truth (CLAUDE.md rule 1) — importing it here too would
 * pull the whole zod runtime into the client bundle for a form this small, and
 * blow the marketing route JS budget for no real benefit over native validation.
 */
function validate(values: typeof initialValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) errors.name = "Enter your name";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Enter a valid email address";
  if (!values.message.trim()) errors.message = "Enter a message";
  return errors;
}

export function ContactForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted">("idle");
  const { publish } = useToast();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const response = await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim() || undefined,
          company: values.company.trim() || undefined,
          message: values.message.trim(),
        }),
      });

      if (response.status === 400) {
        const body = (await response.json()) as { issues?: Record<string, string[]> };
        const serverErrors: FieldErrors = {};
        for (const key of ["name", "email", "phone", "company", "message"] as const) {
          const issue = body.issues?.[key]?.[0];
          if (issue) serverErrors[key] = issue;
        }
        setErrors(serverErrors);
        setStatus("idle");
        return;
      }

      if (!response.ok) throw new Error(`API responded with ${response.status}`);

      setStatus("submitted");
      setValues(initialValues);
      publish({
        title: "Message sent",
        description: "We'll get back to you shortly.",
        tone: "confirm",
      });
    } catch {
      setStatus("idle");
      publish({
        title: "Something went wrong",
        description: "Your message wasn't sent. Please try again in a moment.",
      });
    }
  }

  if (status === "submitted") {
    return (
      <div className="rounded-2xl border border-confirm/40 bg-confirm-bg p-6 text-confirm">
        <p className="font-semibold">Thanks, that&apos;s in.</p>
        <p className="mt-1 text-sm text-ink-muted">We&apos;ll get back to you shortly.</p>
        <Button className="mt-4" variant="outline" onClick={() => setStatus("idle")}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        <FieldError id="name-error">{errors.name}</FieldError>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          <FieldError id="email-error">{errors.email}</FieldError>
        </div>
        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
          />
          <FieldError id="phone-error">{errors.phone}</FieldError>
        </div>
      </div>

      <div>
        <Label htmlFor="company">Company (optional)</Label>
        <Input
          id="company"
          name="company"
          autoComplete="organization"
          value={values.company}
          onChange={(e) => setValues((v) => ({ ...v, company: e.target.value }))}
          aria-invalid={Boolean(errors.company)}
          aria-describedby={errors.company ? "company-error" : undefined}
        />
        <FieldError id="company-error">{errors.company}</FieldError>
      </div>

      <div>
        <Label htmlFor="message">What do you need moved?</Label>
        <Textarea
          id="message"
          name="message"
          value={values.message}
          onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        <FieldError id="message-error">{errors.message}</FieldError>
      </div>

      <Button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
