"use client";

import { ChevronDown, Grid2X2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { NavCategory } from "./types";

/**
 * Category links are always present in the server-rendered HTML (crawlable);
 * JS only toggles visibility.
 */
export default function CategoryMenu({ categories }: { categories: NavCategory[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="category-menu-panel"
        onClick={() => setOpen((value) => !value)}
        className={[
          "flex h-10 items-center gap-2 rounded-xl px-4 text-[11px] font-black transition",
          open
            ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/15"
            : "bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]",
        ].join(" ")}
      >
        <Grid2X2 size={16} aria-hidden />
        دسته‌بندی کالاها
        <ChevronDown size={14} aria-hidden className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      <div
        id="category-menu-panel"
        hidden={!open}
        className="absolute right-0 top-[calc(100%+10px)] z-50 w-[min(720px,90vw)] overflow-hidden rounded-[26px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_25px_80px_rgba(0,0,0,0.18)]"
      >
        <div className="h-1 bg-gradient-to-l from-[var(--primary)] to-[var(--primary)]/20" />
        <nav aria-label="دسته‌بندی کالاها" className="grid grid-cols-2 gap-1 p-4 xl:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2.5 text-xs font-bold text-[var(--text)] transition hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
            >
              {category.name}
            </Link>
          ))}
        </nav>
        <Link
          href="/products"
          onClick={() => setOpen(false)}
          className="block border-t border-[var(--border)] bg-[var(--surface-2)] px-5 py-3 text-xs font-black text-[var(--primary)]"
        >
          مشاهده همه محصولات
        </Link>
      </div>
    </div>
  );
}
