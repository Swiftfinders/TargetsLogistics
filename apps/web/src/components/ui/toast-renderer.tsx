"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { cn } from "@/lib/cn";

interface ToastMessage {
  id: number;
  title: string;
  description?: string;
  tone?: "neutral" | "confirm";
}

export default function ToastRenderer({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}) {
  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {toasts.map((toast) => (
        <ToastPrimitive.Root
          key={toast.id}
          duration={5000}
          onOpenChange={(open) => {
            if (!open) onDismiss(toast.id);
          }}
          className={cn(
            "rounded-xl border border-line bg-bg p-4 shadow-lg",
            toast.tone === "confirm" && "border-confirm/40",
          )}
        >
          <ToastPrimitive.Title className="text-sm font-semibold text-ink">{toast.title}</ToastPrimitive.Title>
          {toast.description && (
            <ToastPrimitive.Description className="mt-1 text-sm text-ink-muted">
              {toast.description}
            </ToastPrimitive.Description>
          )}
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-50 flex w-full max-w-sm flex-col gap-2 p-6 outline-none" />
    </ToastPrimitive.Provider>
  );
}
