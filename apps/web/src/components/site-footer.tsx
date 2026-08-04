import Link from "next/link";
import { Logo } from "@/components/logo";
import { marketingNav, siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-bg-raised">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-start md:justify-between">
        <div>
          <Logo />
          <p className="mt-2 max-w-xs text-sm text-ink-muted">{siteConfig.tagline}.</p>
          <p className="mt-3 text-xs uppercase tracking-wide text-ink-muted">
            {siteConfig.cities.join(" · ")}
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
          {marketingNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className="text-ink-muted hover:text-ink hover:underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <nav aria-label="Account" className="flex flex-col gap-2 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Account</span>
          <Link href="/portal/signup" prefetch={false} className="text-ink-muted hover:text-ink hover:underline">
            Client sign up
          </Link>
          <Link href="/portal/login" prefetch={false} className="text-ink-muted hover:text-ink hover:underline">
            Client login
          </Link>
          <Link href="/staff/login" prefetch={false} className="text-ink-muted hover:text-ink hover:underline">
            Staff login
          </Link>
        </nav>
      </div>
      <div className="border-t border-line px-5 py-4 text-xs text-ink-muted">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </div>
    </footer>
  );
}
