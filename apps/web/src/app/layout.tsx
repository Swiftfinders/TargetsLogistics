import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Targets Logistics",
  description: "Phase 0 skeleton — marketing content lands in Phase 1/2.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
