"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { publicEnv } from "@/lib/public-env";

type Fields = "name" | "email" | "company" | "password" | "confirmPassword";

const initialValues = { name: "", email: "", company: "", password: "", confirmPassword: "" };

function validate(values: typeof initialValues) {
  const errors: Partial<Record<Fields, string>> = {};
  if (!values.name.trim()) errors.name = "Enter your name";
  if (!values.email.trim()) errors.email = "Enter your email";
  if (!values.company.trim()) errors.company = "Enter your company name";
  if (values.password.length < 10) errors.password = "Use at least 10 characters";
  if (values.confirmPassword !== values.password) errors.confirmPassword = "Passwords don't match";
  return errors;
}

export function SignupForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<Fields, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
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
      const response = await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          company: values.company.trim(),
          password: values.password,
        }),
      });

      if (response.status === 409) {
        setSubmitError("An account with that email already exists. Try signing in instead.");
        setStatus("idle");
        return;
      }
      if (!response.ok) throw new Error(`API responded ${response.status}`);

      setStatus("done");
    } catch {
      setSubmitError("Something went wrong submitting your request. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-xl border border-confirm/40 bg-confirm/10 p-4 text-sm text-ink">
        Thanks — we&apos;ve received your request. Our team will review it and you&apos;ll be able to sign in
        once it&apos;s approved.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <Label htmlFor="name">Your name</Label>
        <Input
          id="name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        <FieldError id="name-error">{errors.name}</FieldError>
      </div>
      <div>
        <Label htmlFor="company">Company name</Label>
        <Input
          id="company"
          value={values.company}
          onChange={(e) => setValues((v) => ({ ...v, company: e.target.value }))}
          aria-invalid={Boolean(errors.company)}
          aria-describedby={errors.company ? "company-error" : undefined}
        />
        <FieldError id="company-error">{errors.company}</FieldError>
      </div>
      <div>
        <Label htmlFor="email">Work email</Label>
        <Input
          id="email"
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
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-error" : undefined}
        />
        <FieldError id="password-error">{errors.password}</FieldError>
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={(e) => setValues((v) => ({ ...v, confirmPassword: e.target.value }))}
          aria-invalid={Boolean(errors.confirmPassword)}
          aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
        />
        <FieldError id="confirmPassword-error">{errors.confirmPassword}</FieldError>
      </div>

      {submitError && <p className="text-sm font-medium text-accent">{submitError}</p>}

      <Button type="submit" className="w-full" disabled={status === "submitting"}>
        {status === "submitting" ? "Submitting…" : "Request access"}
      </Button>
    </form>
  );
}
