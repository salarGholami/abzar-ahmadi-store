"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ChevronDown, Grid2X2, Package, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { NavCategory } from "./types";

export default function CategoryMenu({
  categories,
}: {
  categories: NavCategory[];
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={rootRef} className="relative">
      {/* =========================================================
          TRIGGER
      ========================================================== */}

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

      {/* =========================================================
          MENU
      ========================================================== */}

      <AnimatePresence>
        {open && (
          <motion.div
            id="category-menu-panel"
            initial={{
              opacity: 0,
              y: 8,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 6,
              scale: 0.98,
            }}
            transition={{
              duration: 0.18,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              absolute right-0 top-[calc(100%+12px)]
              z-50
              w-[min(760px,90vw)]
              overflow-hidden
              rounded-[28px]
              border border-[var(--border)]
              bg-[var(--surface)]
              shadow-[0_30px_100px_rgba(0,0,0,0.20)]
            "
          >
            {/* Accent */}
            <div
              className="
                h-[3px]
                bg-gradient-to-l
                from-[var(--primary)]
                via-[var(--primary)]/70
                to-transparent
              "
            />

            {/* =====================================================
                HEADER
            ====================================================== */}

            <div
              className="
                flex items-center justify-between
                border-b border-[var(--border)]
                px-5 py-4
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    grid size-10 place-items-center
                    rounded-2xl
                    bg-[var(--primary)]/10
                    text-[var(--primary)]
                  "
                >
                  <Package size={18} />
                </div>

                <div>
                  <p className="text-xs font-black text-[var(--text)]">
                    دسته‌بندی محصولات
                  </p>

                  <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                    ابزار موردنیاز خود را انتخاب کنید
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="بستن"
                className="
                  grid size-9 place-items-center
                  rounded-xl
                  bg-[var(--surface-2)]
                  text-[var(--muted)]
                  transition
                  hover:text-[var(--text)]
                "
              >
                <X size={16} />
              </button>
            </div>

            {/* =====================================================
                CATEGORIES
            ====================================================== */}

            <nav
              aria-label="دسته‌بندی کالاها"
              className="
                grid
                max-h-[430px]
                grid-cols-2
                gap-2
                overflow-y-auto
                p-4
                xl:grid-cols-3
              "
            >
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  onClick={() => setOpen(false)}
                  className="
                    group
                    flex items-center gap-3
                    rounded-2xl
                    border border-transparent
                    bg-[var(--surface-2)]
                    px-3.5 py-3
                    transition-all duration-200
                    hover:border-[var(--primary)]/20
                    hover:bg-[var(--primary)]/[0.06]
                  "
                >
                  <span
                    className="
                      grid size-9 shrink-0
                      place-items-center
                      rounded-xl
                      bg-[var(--surface)]
                      text-[var(--muted)]
                      transition
                      group-hover:bg-[var(--primary)]/10
                      group-hover:text-[var(--primary)]
                    "
                  >
                    <Grid2X2 size={15} />
                  </span>

                  <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-[var(--text)]">
                    {category.name}
                  </span>

                  <ArrowLeft
                    size={13}
                    className="
                      shrink-0
                      text-[var(--muted)]
                      transition
                      group-hover:-translate-x-0.5
                      group-hover:text-[var(--primary)]
                    "
                  />
                </Link>
              ))}
            </nav>

            {/* =====================================================
                FOOTER
            ====================================================== */}

            <div
              className="
                flex items-center justify-between
                border-t border-[var(--border)]
                bg-[var(--surface-2)]
                px-5 py-3.5
              "
            >
              <div>
                <p className="text-[10px] font-bold text-[var(--muted)]">
                  همه محصولات در یکجا
                </p>
              </div>

              <Link
                href="/products"
                onClick={() => setOpen(false)}
                className="
                  inline-flex items-center gap-1.5
                  rounded-xl
                  bg-[var(--primary)]
                  px-3.5 py-2
                  text-[10px] font-black
                  text-white
                  shadow-md
                  shadow-[var(--primary)]/15
                  transition
                  hover:-translate-y-0.5
                "
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
