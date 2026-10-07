"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

type ToastTone = "success" | "error" | "info";

type ToastItem = {
  id: string;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  push: (message: string, tone?: ToastTone) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_STYLES: Record<ToastTone, string> = {
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/80 dark:text-emerald-100",
  error:
    "border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/80 dark:text-red-100",
  info: "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]",
};

const TONE_ICON: Record<ToastTone, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const push = useCallback((message: string, tone: ToastTone = "info") => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    setItems((prev) => [...prev.slice(-3), { id, message, tone }]);
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      push,
      success: (message) => push(message, "success"),
      error: (message) => push(message, "error"),
      info: (message) => push(message, "info"),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] z-[100] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:px-6"
      >
        {items.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(item.id), 3200);
    return () => window.clearTimeout(timer);
  }, [item.id, onDismiss]);

  const Icon = TONE_ICON[item.tone];

  return (
    <div
      role="status"
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300 ${TONE_STYLES[item.tone]}`}
    >
      <Icon size={18} className="mt-0.5 shrink-0 opacity-90" />
      <p className="flex-1 text-sm font-bold leading-6">{item.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="grid size-7 shrink-0 place-items-center rounded-lg opacity-60 transition hover:opacity-100"
        aria-label="بستن اعلان"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
