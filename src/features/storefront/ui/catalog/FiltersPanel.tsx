
"use client";

import {
  ChevronDown,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";
import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

type FiltersPanelProps = {
  children: ReactNode;
  activeCount: number;
};

type FilterSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

/**
 * Mobile filter accordion section.
 *
 * Each section owns only its open/closed state.
 * The actual filter content remains outside this component's responsibility.
 */
export function FilterSection({
  title,
  description,
  children,
  defaultOpen = false,
}: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-b border-[var(--border)] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex min-h-[72px] w-full items-center justify-between gap-4 py-4 text-right"
      >
        <span className="min-w-0">
          <span className="block text-sm font-black text-[var(--foreground)]">
            {title}
          </span>

          {description ? (
            <span className="mt-1 block text-[11px] leading-5 text-[var(--muted)]">
              {description}
            </span>
          ) : null}
        </span>

        <span
          className={[
            "grid size-9 shrink-0 place-items-center rounded-xl",
            "bg-[var(--surface-2)]",
            "text-[var(--muted)]",
            "transition-transform duration-200",
            open ? "rotate-180" : "",
          ].join(" ")}
        >
          <ChevronDown
            size={17}
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </span>
      </button>

      {open ? (
        <div className="min-w-0 overflow-hidden pb-5">
          {children}
        </div>
      ) : null}
    </section>
  );
}

export default function FiltersPanel({
  children,
  activeCount,
}: FiltersPanelProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  /**
   * Portal can only use document after hydration.
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Lock body scrolling while the mobile drawer is open.
   */
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const mobileDrawer = (
    <div
      dir="rtl"
      className={[
        "fixed inset-0 z-[99999] lg:hidden",
        open ? "visible" : "invisible pointer-events-none",
      ].join(" ")}
    >
      {/* =====================================================
          BACKDROP
         ===================================================== */}
      <button
        type="button"
        aria-label="بستن فیلترها"
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
        className={[
          "absolute inset-0",
          "bg-black/60",
          "backdrop-blur-[2px]",
          "transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />

      {/* =====================================================
          DRAWER
         ===================================================== */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="فیلتر محصولات"
        className={[
          "absolute inset-y-0 right-0",
          "flex w-full flex-col",
          "bg-[var(--surface)]",
          "shadow-2xl",
          "transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        {/* ===================================================
            HEADER
           =================================================== */}
        <header className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
              <SlidersHorizontal
                size={18}
                strokeWidth={2.5}
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-black">
                فیلتر محصولات
              </h2>

              <p className="mt-1 text-[11px] text-[var(--muted)]">
                {activeCount > 0
                  ? `${activeCount.toLocaleString("fa-IR")} فیلتر فعال`
                  : "محصول مناسب خودت را پیدا کن"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            tabIndex={open ? 0 : -1}
            aria-label="بستن فیلترها"
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--surface-2)] transition-colors hover:bg-[var(--border)]"
          >
            <X
              size={18}
              strokeWidth={2.5}
              aria-hidden="true"
            />
          </button>
        </header>

        {/* ===================================================
            ACTIVE FILTERS
           =================================================== */}
        {activeCount > 0 ? (
          <div className="shrink-0 border-b border-[var(--border)] px-4 py-3">
            <div className="rounded-xl bg-[var(--primary)]/10 px-3 py-2.5 text-xs font-bold text-[var(--primary)]">
              {activeCount.toLocaleString("fa-IR")} فیلتر فعال
            </div>
          </div>
        ) : null}

        {/* ===================================================
            FILTER CONTENT

            Important:
            children are rendered directly inside the drawer.
           =================================================== */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="w-full px-4">
            {children}
          </div>
        </div>

        {/* ===================================================
            FOOTER
           =================================================== */}
        <footer className="shrink-0 border-t border-[var(--border)] bg-[var(--surface)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className={[
              "flex h-12 w-full items-center justify-center",
              "rounded-2xl",
              "bg-[var(--primary)]",
              "text-sm font-black text-white",
              "shadow-lg shadow-[var(--primary)]/20",
              "transition-all",
              "hover:brightness-105",
              "active:scale-[0.99]",
            ].join(" ")}
          >
            نمایش نتایج
          </button>
        </footer>
      </aside>
    </div>
  );

  return (
    <>
      {/* =====================================================
          TRIGGER
         ===================================================== */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={[
          "flex h-11 items-center gap-2",
          "rounded-xl",
          "border border-[var(--border)]",
          "bg-[var(--surface)]",
          "px-4",
          "text-xs font-black",
          "transition-colors",
          "hover:border-[var(--primary)]",
          "lg:hidden",
        ].join(" ")}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <SlidersHorizontal
          size={16}
          strokeWidth={2.5}
          aria-hidden="true"
        />

        <span>فیلترها</span>

        {activeCount > 0 ? (
          <span className="grid size-5 place-items-center rounded-full bg-[var(--primary)] text-[10px] font-black text-white">
            {activeCount.toLocaleString("fa-IR")}
          </span>
        ) : null}
      </button>

      {/* =====================================================
          PORTAL

          The drawer is moved directly under <body>.
          This prevents sticky/backdrop-blur parents from
          creating a containing block for position: fixed.
         ===================================================== */}
      {mounted
        ? createPortal(mobileDrawer, document.body)
        : null}
    </>
  );
}

