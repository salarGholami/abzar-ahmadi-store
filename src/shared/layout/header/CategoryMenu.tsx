"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ChevronDown, Grid2X2, ImageOff, Package, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { NavCategory } from "./types";

function CategoryImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const hasSrc = Boolean(src && String(src).trim() && !failed);

  if (!hasSrc) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-[var(--surface-2)] text-[var(--muted)] ${className || ""}`}
      >
        <ImageOff size={28} strokeWidth={1.5} />
        <span className="text-[10px] font-bold">بدون تصویر</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src!}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

export default function CategoryMenu({
  categories,
}: {
  categories: NavCategory[];
}) {
  const [open, setOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const active =
    categories.find((c) => c.id === hoveredId) || categories[0] || null;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  useEffect(() => {
    if (open && categories.length > 0) {
      setHoveredId((current) => current ?? categories[0].id);
    }
    if (!open) {
      setHoveredId(null);
    }
  }, [open, categories]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="category-menu-panel"
        onClick={() => setOpen((value) => !value)}
        className={`
          group
          relative
          flex h-11 items-center gap-2.5
          overflow-hidden
          rounded-2xl
          px-4
          text-[11px]
          font-black
          transition-all duration-300
          ${
            open
              ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20"
              : "bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--primary)]/[0.08] hover:text-[var(--primary)]"
          }
        `}
      >
        <span
          className={`
            absolute inset-0
            bg-white/10
            transition-transform duration-500
            ${
              open
                ? "translate-x-0"
                : "-translate-x-full group-hover:translate-x-0"
            }
          `}
        />

        <span className="relative z-10 grid size-7 place-items-center rounded-lg bg-black/5">
          <Grid2X2 size={15} strokeWidth={2.2} />
        </span>

        <span className="relative z-10">دسته‌بندی کالاها</span>

        <ChevronDown
          size={14}
          className={`
            relative z-10
            transition-transform duration-300
            ${open ? "rotate-180" : ""}
          `}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="category-menu-panel"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="
              absolute right-0 top-[calc(100%+12px)]
              z-50
              w-[min(860px,92vw)]
              overflow-hidden
              rounded-[28px]
              border border-[var(--border)]
              bg-[var(--surface)]
              shadow-[0_30px_100px_rgba(0,0,0,0.20)]
            "
          >
            <div className="h-[3px] bg-gradient-to-l from-[var(--primary)] via-[var(--primary)]/70 to-transparent" />

            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
                  <Package size={18} />
                </div>
                <div>
                  <p className="text-xs font-black text-[var(--text)]">دسته‌بندی محصولات</p>
                  <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                    روی هر دسته بروید تا تصویر آن را ببینید
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="بستن"
                className="grid size-9 place-items-center rounded-xl bg-[var(--surface-2)] text-[var(--muted)] transition hover:text-[var(--text)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex max-h-[440px] min-h-[280px]">
              <nav
                aria-label="دسته‌بندی کالاها"
                className="flex-1 overflow-y-auto border-l border-[var(--border)] p-3"
              >
                <ul className="space-y-1">
                  {categories.map((category) => {
                    const isActive = active?.id === category.id;
                    return (
                      <li key={category.id}>
                        <Link
                          href={`/categories/${category.slug}`}
                          onClick={() => setOpen(false)}
                          onMouseEnter={() => setHoveredId(category.id)}
                          onFocus={() => setHoveredId(category.id)}
                          className={`
                            group flex items-center gap-3 rounded-2xl border px-3.5 py-2.5 transition-all duration-200
                            ${
                              isActive
                                ? "border-[var(--primary)]/25 bg-[var(--primary)]/[0.08]"
                                : "border-transparent bg-transparent hover:bg-[var(--surface-2)]"
                            }
                          `}
                        >
                          <span
                            className={`
                              grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl
                              ${
                                isActive
                                  ? "bg-[var(--primary)]/15 text-[var(--primary)]"
                                  : "bg-[var(--surface-2)] text-[var(--muted)] group-hover:text-[var(--primary)]"
                              }
                            `}
                          >
                            {category.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={category.image}
                                alt=""
                                className="size-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <Grid2X2 size={15} />
                            )}
                          </span>
                          <span
                            className={`min-w-0 flex-1 truncate text-[11px] font-bold ${
                              isActive ? "text-[var(--primary)]" : "text-[var(--text)]"
                            }`}
                          >
                            {category.name}
                          </span>
                          <ArrowLeft
                            size={13}
                            className={`shrink-0 transition ${
                              isActive
                                ? "text-[var(--primary)] -translate-x-0.5"
                                : "text-[var(--muted)] group-hover:-translate-x-0.5 group-hover:text-[var(--primary)]"
                            }`}
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="hidden w-[280px] shrink-0 flex-col p-4 sm:flex">
                <div className="relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]">
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <CategoryImage
                      key={active?.id || "none"}
                      src={active?.image}
                      alt={active?.name || "دسته"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="border-t border-[var(--border)] px-4 py-3">
                    <p className="text-xs font-black text-[var(--text)]">
                      {active?.name || "دسته‌بندی"}
                    </p>
                    <p className="mt-1 text-[10px] text-[var(--muted)]">
                      برای مشاهده محصولات این دسته کلیک کنید
                    </p>
                    {active && (
                      <Link
                        href={`/categories/${active.slug}`}
                        onClick={() => setOpen(false)}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-3 py-1.5 text-[10px] font-black text-white transition hover:-translate-y-0.5"
                      >
                        مشاهده دسته
                        <ArrowLeft size={12} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--surface-2)] px-5 py-3.5">
              <div>
                <p className="text-[10px] font-bold text-[var(--muted)]">همه محصولات در یکجا</p>
              </div>
              <Link
                href="/products"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-3.5 py-2 text-[10px] font-black text-white shadow-md shadow-[var(--primary)]/15 transition hover:-translate-y-0.5"
              >
                مشاهده همه
                <ArrowLeft size={13} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
