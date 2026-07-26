"use client";

import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

interface ToastMessage {
  id: number;
  title: string;
  description?: string;
  tone?: "neutral" | "confirm";
}

interface ToastContextValue {
  publish: (toast: Omit<ToastMessage, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

// Radix's toast primitive only loads once a toast is actually published, instead
// of shipping in every marketing route's initial bundle for a widget most visitors
// never trigger.
const ToastRenderer = dynamic(() => import("./toast-renderer"), { ssr: false });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Warms the lazy chunk once the browser is idle, so it's cached (near-instant)
  // by the time a toast actually fires, without counting toward initial page JS.
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1));
    const handle = idle(() => {
      import("./toast-renderer");
    });
    return () => {
      if (window.cancelIdleCallback && typeof handle === "number") window.cancelIdleCallback(handle);
    };
  }, []);

  const publish = useCallback((toast: Omit<ToastMessage, "id">) => {
    setToasts((current) => [...current, { ...toast, id: Date.now() }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ publish }}>
      {children}
      {toasts.length > 0 && <ToastRenderer toasts={toasts} onDismiss={dismiss} />}
    </ToastContext.Provider>
  );
}
