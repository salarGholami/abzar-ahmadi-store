"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

type FiltersPanelProps = {
  children: ReactNode;
  activeCount: number;
};

/**
 * Client interaction shell for the catalog filters.
 *
 * The filter content is intentionally mounted once and never conditionally
 * replaced when the drawer opens/closes. This keeps the React tree stable
 * across mobile drawer transitions and avoids unnecessary reconciliation of
 * Server Component children.
 */
export default function FiltersPanel({ children, activeCount }: FiltersPanelProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-xs font-black lg:hidden"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <SlidersHorizontal size={16} aria-hidden="true" />
        فیلترها
        {activeCount > 0 ? (
          <span className="grid size-5 place-items-center rounded-full bg-[var(--primary)] text-[10px] text-white">
            {activeCount.toLocaleString("fa-IR")}
          </span>
        ) : null}
      </button>

      <div
        className={
          open
            ? "fixed inset-0 z-[90] lg:static lg:z-auto"
            : "pointer-events-none fixed inset-0 z-[90] invisible lg:pointer-events-auto lg:visible lg:static lg:z-auto"
        }
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="بستن فیلترها"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
          className={
            open
              ? "absolute inset-0 cursor-default bg-black/50 backdrop-blur-[2px] opacity-100 transition-opacity lg:hidden"
              : "absolute inset-0 cursor-default bg-black/50 opacity-0 transition-opacity lg:hidden"
          }
        />

        <div
          role={open ? "dialog" : undefined}
          aria-modal={open ? true : undefined}
          aria-label="فیلترها"
          className={
            open
              ? "absolute inset-y-0 right-0 w-[88%] max-w-sm overflow-y-auto bg-[var(--surface)] p-4 shadow-2xl translate-x-0 transition-transform duration-200 lg:static lg:w-auto lg:max-w-none lg:translate-x-0 lg:overflow-visible lg:bg-transparent lg:p-0 lg:shadow-none"
              : "absolute inset-y-0 right-0 w-[88%] max-w-sm overflow-y-auto bg-[var(--surface)] p-4 shadow-2xl translate-x-full transition-transform duration-200 lg:static lg:w-auto lg:max-w-none lg:translate-x-0 lg:overflow-visible lg:bg-transparent lg:p-0 lg:shadow-none"
          }
        >
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <span className="text-sm font-black">فیلترها</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              aria-label="بستن فیلترها"
              className="grid size-9 place-items-center rounded-xl bg-[var(--surface-2)]"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          {children}
        </div>
      </div>
    </>
  );
}
