"use client";

import Link from "next/link";
import { Search, ShoppingCart, UserRound, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import ThemeToggle from "../ui/ThemeToggle";
import { useCart } from "@/lib/cart-context";
import type { Category } from "@/lib/types";

export default function StoreHeader() {
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const { count, subtotal } = useCart();

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/auth/me", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/categories", { cache: "no-store" }).then((r) => r.json()),
    ]).then(([userResult, categoryResult]) => {
      if (!active) return;
      if (userResult.success) setUserName(userResult.data.name);
      if (categoryResult.success) setCategories(categoryResult.data);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-3 lg:px-6">
        <button className="btn btn-secondary !size-11 !p-0 lg:hidden" type="button" onClick={() => setOpen((value) => !value)} aria-label="منوی فروشگاه">
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>

        <Link href="/" className="flex min-w-fit items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-[var(--primary)] text-xl font-black text-white">آ</div>
          <div><div className="text-lg font-black">ابزارینو</div><div className="hidden text-[10px] font-bold text-[var(--muted)] sm:block">تجهیزات حرفه‌ای ساخت‌وساز</div></div>
        </Link>

        <nav className="hidden items-center gap-5 xl:flex">
          {categories.slice(0, 5).map((category) => (
            <Link key={category.id} className="text-xs font-black text-[var(--muted)] hover:text-[var(--text)]" href={`/products?category=${encodeURIComponent(category.name)}`}>{category.name}</Link>
          ))}
          <Link className="text-xs font-black text-[var(--primary)]" href="/products">همه محصولات</Link>
        </nav>

        <div className="mr-auto flex items-center gap-2">
          <Link href="/products" className="hidden h-11 w-64 items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-xs font-bold text-[var(--muted)] lg:flex"><Search size={17} />جستجوی محصول، برند یا SKU</Link>
          <ThemeToggle />
          <Link href="/account" className="btn btn-secondary !size-11 !p-0 sm:!w-auto sm:!px-3" title={userName || "حساب کاربری"}><UserRound size={18} />{userName && <span className="hidden text-xs font-bold sm:inline">{userName}</span>}</Link>
          <Link href="/cart" className={`relative flex h-11 items-center gap-2 rounded-xl px-3 text-xs font-black transition ${count > 0 ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20" : "btn btn-primary !p-2.5"}`}>
            <ShoppingCart size={18} />
            {count > 0 ? (
              <span className="hidden sm:block">سبد خرید · {count.toLocaleString("fa-IR")} عدد</span>
            ) : <span className="hidden sm:block">سبد خرید</span>}
            {count > 0 && <span className="grid size-5 place-items-center rounded-full bg-white/20 text-[10px]">{count.toLocaleString("fa-IR")}</span>}
          </Link>
        </div>
      </div>

      {open && (
        <div className="border-t border-[var(--border)] bg-[var(--surface)] p-4 shadow-xl lg:hidden">
          <div className="grid gap-1">
            {categories.map((category) => <Link key={category.id} href={`/products?category=${encodeURIComponent(category.name)}`} className="rounded-xl px-3 py-3 text-sm font-bold hover:bg-[var(--surface-2)]" onClick={() => setOpen(false)}>{category.name}</Link>)}
            <Link href="/products" className="rounded-xl px-3 py-3 text-sm font-black text-[var(--primary)]" onClick={() => setOpen(false)}>مشاهده همه محصولات</Link>
            {count > 0 && <div className="mt-2 rounded-xl bg-[var(--surface-2)] p-3 text-xs font-bold text-[var(--muted)]">سبد خرید: {count.toLocaleString("fa-IR")} عدد · {subtotal.toLocaleString("fa-IR")} تومان</div>}
          </div>
        </div>
      )}
    </header>
  );
}
