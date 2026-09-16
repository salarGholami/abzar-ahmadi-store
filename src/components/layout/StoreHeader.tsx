"use client";
import Link from "next/link";
import { Search, ShoppingCart, UserRound, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import ThemeToggle from "../ui/ThemeToggle";
import { useCart } from "@/lib/cart-context";

const cats = ["ابزار برقی", "ابزار دستی", "اندازه‌گیری", "جوشکاری", "تجهیزات کارگاهی", "ایمنی"];

export default function StoreHeader() {
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const { count } = useCart();

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me").then((r) => r.json()).then((j) => {
      if (active && j.success) setUserName(j.data.name);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-3 lg:px-6">
        <button className="btn btn-secondary lg:hidden !p-2" type="button" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        <Link href="/" className="flex items-center gap-3 min-w-fit">
          <div className="grid size-10 place-items-center rounded-xl bg-[var(--primary)] text-xl font-black text-white">آ</div>
          <div><div className="text-lg font-black">ابزارینو</div><div className="hidden text-[10px] text-[var(--muted)] sm:block">تجهیزات حرفه‌ای ساخت‌وساز</div></div>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {cats.slice(0, 4).map((c) => <Link className="text-sm font-bold text-[var(--muted)] hover:text-[var(--text)]" key={c} href={`/products?category=${encodeURIComponent(c)}`}>{c}</Link>)}
          <Link className="text-sm font-bold text-[var(--primary)]" href="/products">مشاهده همه</Link>
        </nav>
        <div className="mr-auto flex items-center gap-2">
          <Link href="/products" className="hidden h-11 w-64 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm text-[var(--muted)] md:flex"><Search size={18} />جستجوی محصول، برند یا SKU</Link>
          <ThemeToggle />
          <Link href="/account" className="btn btn-secondary !p-2.5" title={userName ? userName : "ورود / ثبت‌نام"}><UserRound size={18} />{userName && <span className="hidden text-xs font-bold sm:inline">{userName}</span>}</Link>
          <Link href="/cart" className="btn btn-primary relative !p-2.5"><ShoppingCart size={18} />{count > 0 && <span className="absolute -left-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white">{count}</span>}</Link>
        </div>
      </div>
      {open && <div className="border-t border-[var(--border)] bg-[var(--surface)] p-4 lg:hidden">{cats.map((c) => <Link key={c} href="/products" className="block border-b border-[var(--border)] py-3 font-bold" onClick={() => setOpen(false)}>{c}</Link>)}</div>}
    </header>
  );
}
