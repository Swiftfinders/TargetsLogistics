import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "ghost" | "outline";
export type ButtonSize = "md" | "sm";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors " +
  "disabled:cursor-not-allowed disabled:opacity-50 " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-ink shadow-[0_8px_20px_-8px_rgba(91,70,217,0.6)] hover:brightness-110",
  outline: "border border-line bg-bg text-ink hover:bg-bg-raised",
  ghost: "text-ink hover:bg-bg-raised",
};

const sizes: Record<ButtonSize, string> = {
  md: "px-6 py-3 text-sm",
  sm: "px-4 py-2 text-xs",
};

/** Shared style function so link-styled CTAs can be real `<a>`/`<Link>` elements instead of nesting a button inside one. */
export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", type = "button", ...props },
  ref,
) {
  return <button ref={ref} type={type} className={buttonClasses(variant, size, className)} {...props} />;
});
