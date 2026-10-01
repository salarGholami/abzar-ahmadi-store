"use client";

import { ClipboardList, Menu, Package, Search, ShoppingBag, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import HeaderSearch from "./HeaderSearch";
import type { NavCategory } from "./types";

const QUICK_LINKS = [
  { href: "/products", label: "همه محصولات", icon: Package },
  { href: "/cart", label: "سبد خرید", icon: ShoppingBag },
  { href: "/order-tracking", label: "پیگیری سفارش", icon: ClipboardList },
  { href: "/account", label: "حساب کاربری", icon: UserRound },
] as const;

type Mode = "menu" | "search" | null;

export default function MobileMenu({ categories }: { categories: NavCategory[] }) {
  const [mode, setMode] = useState<Mode>(null);
  const close = () => setMode(null);

  useEffect(() => {
    if (!mode) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMode(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mode]);

  return (
    <>
      <div className="flex items-center gap-2 lg:hidden">
        <button type="button" onClick={() => setMode("menu")} aria-label="باز کردن منو" aria-haspopup="dialog" className="grid size-11 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]">
          <Menu size={20} />
        </button>
        <button type="button" onClick={() => setMode("search")} aria-label="جستجو" aria-haspopup="dialog" className="grid size-11 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]">
          <Search size={19} />
        </button>
      </div>

      {mode ? (
        <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true" aria-label={mode === "menu" ? "منوی سایت" : "جستجو"}>
          <button type="button" aria-label="بستن" onClick={close} className="absolute inset-0 cursor-default bg-black/55" />
          <div className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col overflow-y-auto bg-[var(--surface)] p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-black">{mode === "menu" ? "منو" : "جستجو"}</span>
              <button type="button" onClick={close} aria-label="بستن" className="grid size-9 place-items-center rounded-xl bg-[var(--surface-2)]">
                <X size={16} />
              </button>
            </div>

            {mode === "search" ? (
              <HeaderSearch inputId="mobile-search" autoFocus onSubmitted={close} />
            ) : (
              <>
                <HeaderSearch inputId="mobile-menu-search" onSubmitted={close} className="mb-4" />
                <nav aria-label="پیوندهای سریع" className="grid grid-cols-2 gap-2">
                  {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
                    <Link key={href} href={href} onClick={close} className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3 text-xs font-black">
                      <Icon size={16} className="text-[var(--primary)]" aria-hidden />
                      {label}
                    </Link>
                  ))}
                </nav>
                <h2 className="mb-2 mt-6 text-xs font-black text-[var(--muted)]">دسته‌بندی کالاها</h2>
                <nav aria-label="دسته‌بندی کالاها" className="flex flex-col">
                  {categories.map((category) => (
                    <Link key={category.id} href={`/categories/${category.slug}`} onClick={close} className="rounded-xl px-3 py-3 text-sm font-bold transition hover:bg-[var(--surface-2)]">
                      {category.name}
                    </Link>
                  ))}
                </nav>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
