"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { marketingNav } from "@/lib/site";
import { buttonClasses } from "@/components/ui/button";
import { Logo } from "@/components/logo";

function ClientLoginLink({ className, onClick = () => {} }: { className?: string; onClick?: () => void }) {
  return (
    <Link href="/portal/login" prefetch={false} onClick={onClick} className={className}>
      Client login
    </Link>
  );
}

function Wordmark() {
  return (
    <Link href="/" prefetch={false} aria-label="Target Logistics, home">
      <Logo slogan />
    </Link>
  );
}

function NavLink({
  href,
  label,
  onNavigate = () => {},
}: {
  href: string;
  label: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      prefetch={false}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:bg-bg-raised",
        isActive ? "text-ink" : "text-ink-muted",
      )}
    >
      {label}
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-line bg-bg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Wordmark />

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {marketingNav.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ClientLoginLink className={buttonClasses("outline", "sm")} />
          <Link href="/order" prefetch={false} className={buttonClasses("primary", "sm")}>
            Book a delivery
          </Link>
        </div>

        <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
          <DialogPrimitive.Trigger asChild>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              className="inline-flex size-10 items-center justify-center rounded-full text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus) md:hidden"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </DialogPrimitive.Trigger>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40 md:hidden" />
            <DialogPrimitive.Content
              aria-label="Site menu"
              className="fixed inset-x-0 top-0 z-50 rounded-b-2xl border-b border-line bg-bg p-5 md:hidden"
            >
              <div className="flex items-center justify-between">
                <Wordmark />
                <DialogPrimitive.Close
                  aria-label="Close menu"
                  className="inline-flex size-10 items-center justify-center rounded-full text-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)"
                >
                  <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4">
                    <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </DialogPrimitive.Close>
              </div>
              <nav aria-label="Primary" className="mt-6 flex flex-col gap-1">
                {marketingNav.map((item) => (
                  <NavLink key={item.href} href={item.href} label={item.label} onNavigate={() => setOpen(false)} />
                ))}
              </nav>
              <div className="mt-4 flex flex-col gap-2">
                <ClientLoginLink
                  className={buttonClasses("outline", "md", "w-full")}
                  onClick={() => setOpen(false)}
                />
                <Link
                  href="/order"
                  prefetch={false}
                  onClick={() => setOpen(false)}
                  className={buttonClasses("primary", "md", "w-full")}
                >
                  Book a delivery
                </Link>
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </div>
    </header>
  );
}
