"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";

type FiltersPanelProps = { children: ReactNode; activeCount: number };

/**
 * Presentation shell only. Filter content is rendered once on the server and
 * passed as children: a static sidebar on desktop, a drawer on mobile.
 */
export default function FiltersPanel({ children, activeCount }: FiltersPanelProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const closeOnNavigate = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("a, button[type='submit']")) setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-xs font-black lg:hidden"
        aria-haspopup="dialog"
      >
        <SlidersHorizontal size={16} />
        فیلترها
        {activeCount > 0 ? (
          <span className="grid size-5 place-items-center rounded-full bg-[var(--primary)] text-[10px] text-white">
            {activeCount.toLocaleString("fa-IR")}
          </span>
        ) : null}
      </button>

      <div className={open ? "fixed inset-0 z-[90] lg:static lg:z-auto" : "hidden lg:block"} onClick={closeOnNavigate}>
        {open ? (
          <button
            type="button"
            aria-label="بستن فیلترها"
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-black/50 lg:hidden"
          />
        ) : null}

        <div
          role={open ? "dialog" : undefined}
          aria-modal={open ? true : undefined}
          aria-label="فیلترها"
          className={
            open
              ? "absolute inset-y-0 right-0 w-[88%] max-w-sm overflow-y-auto bg-[var(--surface)] p-4 shadow-2xl lg:static lg:w-auto lg:max-w-none lg:overflow-visible lg:bg-transparent lg:p-0 lg:shadow-none"
              : "rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4"
          }
        >
          {open ? (
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <span className="text-sm font-black">فیلترها</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="بستن" className="grid size-9 place-items-center rounded-xl bg-[var(--surface-2)]">
                <X size={16} />
              </button>
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </>
  );
}
