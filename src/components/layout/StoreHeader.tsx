"use client";

import Link from "next/link";
import {
  Search,
  ShoppingCart,
  UserRound,
  Menu,
  X,
  ChevronDown,
  ArrowLeft,
  Package,
  Grid3X3,
} from "lucide-react";
import { useEffect, useState } from "react";
import ThemeToggle from "../ui/ThemeToggle";
import { useCart } from "@/lib/cart-context";
import type { Category } from "@/lib/types";

export default function StoreHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const { count, subtotal } = useCart();

  useEffect(() => {
    let active = true;

    Promise.all([
      fetch("/api/auth/me", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/categories", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([userResult, categoryResult]) => {
        if (!active) return;

        if (userResult?.success) {
          setUserName(userResult.data?.name ?? null);
        }

        if (categoryResult?.success && Array.isArray(categoryResult.data)) {
          setCategories(
            categoryResult.data.filter((c: Category) => c.active !== false),
          );
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  function closeMegaMenu() {
    setMegaMenuOpen(false);
  }

  return (
    <header
      className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_96%,transparent)] backdrop-blur-xl"
      onMouseLeave={closeMegaMenu}
    >
      <div className="mx-auto flex h-[76px] max-w-[1500px] items-center gap-3 px-4 lg:px-6">
        {/* همبرگر فقط موبایل — روی دسکتاپ کاملاً مخفی */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((value) => !value)}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] lg:!hidden"
          aria-label={mobileMenuOpen ? "بستن منو" : "باز کردن منو"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X size={20} strokeWidth={2.2} />
          ) : (
            <Menu size={20} strokeWidth={2.2} />
          )}
        </button>

        {/* لوگو */}
        <Link
          href="/"
          className="group flex min-w-fit items-center gap-3"
          onClick={closeMobileMenu}
        >
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--primary)] text-xl font-black text-white shadow-lg shadow-[var(--primary)]/20 transition-transform duration-200 group-hover:scale-105">
            آ
          </div>
          <div className="hidden sm:block">
            <div className="text-lg font-black leading-none">ابزارینو</div>
            <div className="mt-1 text-[10px] font-bold text-[var(--muted)]">
              تجهیزات حرفه‌ای ساخت‌وساز
            </div>
          </div>
        </Link>

        {/* ناوبری دسکتاپ */}
        <nav className="hidden items-center gap-1 xl:flex">
          <div className="relative" onMouseEnter={() => setMegaMenuOpen(true)}>
            <button
              type="button"
              className={`flex h-11 items-center gap-2 rounded-xl px-4 text-xs font-black transition ${
                megaMenuOpen
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
              }`}
              aria-expanded={megaMenuOpen}
            >
              <Grid3X3 size={17} />
              محصولات
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${megaMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {megaMenuOpen && (
              <div
                className="absolute right-0 top-[calc(100%+10px)] w-[min(850px,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl shadow-black/15"
                onMouseEnter={() => setMegaMenuOpen(true)}
              >
                <div className="h-1 bg-[var(--primary)]" />
                <div className="p-6">
                  <div className="mb-5 flex items-center justify-between border-b border-[var(--border)] pb-5">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                        <Package size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-black">
                          دسته‌بندی محصولات
                        </div>
                        <div className="mt-1 text-[11px] font-medium text-[var(--muted)]">
                          محصول مورد نظر خود را از دسته‌بندی‌ها انتخاب کنید
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/products"
                      onClick={closeMegaMenu}
                      className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black text-[var(--primary)] transition hover:bg-[var(--primary)]/10"
                    >
                      همه محصولات
                      <ArrowLeft size={14} />
                    </Link>
                  </div>

                  {categories.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-3">
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/products?category=${encodeURIComponent(category.name)}`}
                          onClick={closeMegaMenu}
                          className="group flex items-center gap-3 rounded-2xl p-3 transition hover:bg-[var(--surface-2)]"
                        >
                          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--surface-2)] text-[var(--muted)] transition group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)]">
                            <Package size={17} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-black text-[var(--text)]">
                              {category.name}
                            </div>
                            <div className="mt-1 text-[9px] font-medium text-[var(--muted)]">
                              مشاهده محصولات
                            </div>
                          </div>
                          <ArrowLeft
                            size={14}
                            className="text-[var(--muted)] opacity-0 transition group-hover:translate-x-[-2px] group-hover:opacity-100"
                          />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center text-xs font-bold text-[var(--muted)]">
                      هنوز دسته‌بندی‌ای ثبت نشده است.
                    </div>
                  )}

                  <div className="mt-5 flex items-center justify-between rounded-2xl bg-[var(--surface-2)] px-4 py-3">
                    <span className="text-[10px] font-bold text-[var(--muted)]">
                      برای مشاهده تمام محصولات وارد فروشگاه شوید
                    </span>
                    <Link
                      href="/products"
                      onClick={closeMegaMenu}
                      className="text-[10px] font-black text-[var(--primary)]"
                    >
                      مشاهده فروشگاه ←
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/products"
            className="flex h-11 items-center rounded-xl px-4 text-xs font-black text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          >
            فروشگاه
          </Link>
          <Link
            href="/products"
            className="flex h-11 items-center rounded-xl px-4 text-xs font-black text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          >
            جدیدترین محصولات
          </Link>
        </nav>

        {/* اکشن‌ها */}
        <div className="mr-auto flex items-center gap-2">
          <Link
            href="/products"
            className="hidden h-11 w-64 items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-xs font-bold text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--text)] lg:flex"
          >
            <Search size={17} />
            جستجوی محصول، برند یا SKU
          </Link>

          <ThemeToggle />

          <Link
            href="/account"
            className="btn btn-secondary !size-11 !shrink-0 !p-0 sm:!w-auto sm:!px-3"
            title={userName || "حساب کاربری"}
          >
            <UserRound size={18} />
            {userName && (
              <span className="hidden max-w-[110px] truncate text-xs font-bold sm:inline">
                {userName}
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            className={`relative flex h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-black transition ${
              count > 0
                ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20"
                : "btn btn-primary !p-2.5"
            }`}
            title="سبد خرید"
          >
            <ShoppingCart size={18} />
            <span className="hidden sm:block">
              {count > 0
                ? `سبد خرید · ${count.toLocaleString("fa-IR")} عدد`
                : "سبد خرید"}
            </span>
            {count > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-white/20 text-[10px]">
                {count.toLocaleString("fa-IR")}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* منوی موبایل */}
      {mobileMenuOpen && (
        <div className="border-t border-[var(--border)] bg-[var(--surface)] shadow-xl lg:hidden">
          <div className="mx-auto max-w-[1500px] p-4">
            <Link
              href="/products"
              onClick={closeMobileMenu}
              className="mb-3 flex h-12 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 text-xs font-bold text-[var(--muted)]"
            >
              <Search size={18} />
              جستجوی محصول، برند یا SKU
            </Link>

            <Link
              href="/products"
              onClick={closeMobileMenu}
              className="mb-2 flex items-center gap-3 rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-black text-white"
            >
              <Grid3X3 size={18} />
              مشاهده همه محصولات
              <ArrowLeft className="mr-auto" size={17} />
            </Link>

            <div className="grid gap-1">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${encodeURIComponent(category.name)}`}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3.5 text-sm font-bold transition hover:bg-[var(--surface-2)]"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--surface-2)] text-[var(--muted)]">
                    <Package size={16} />
                  </span>
                  <span>{category.name}</span>
                  <ArrowLeft
                    size={15}
                    className="mr-auto text-[var(--muted)]"
                  />
                </Link>
              ))}
            </div>

            {count > 0 && (
              <Link
                href="/cart"
                onClick={closeMobileMenu}
                className="mt-3 block rounded-2xl bg-[var(--surface-2)] p-4"
              >
                <div className="flex items-center gap-2 text-xs font-black">
                  <ShoppingCart size={17} />
                  سبد خرید
                </div>
                <div className="mt-2 text-[11px] font-bold text-[var(--muted)]">
                  {count.toLocaleString("fa-IR")} عدد ·{" "}
                  {subtotal.toLocaleString("fa-IR")} تومان
                </div>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
