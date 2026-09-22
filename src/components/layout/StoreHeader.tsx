"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  Grid3X3,
  Menu,
  Package,
  Search,
  ShoppingCart,
  UserRound,
  X,
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


  const [isDark, setIsDark] = useState(false);

  const { count, subtotal } = useCart();

  /* =========================================================
     THEME OBSERVER
     ========================================================= */

  useEffect(() => {
    const root = document.documentElement;

    const updateTheme = () => {
      setIsDark(root.classList.contains("dark"));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  /* =========================================================
     LOAD HEADER DATA
     ========================================================= */

  useEffect(() => {
    let active = true;

    async function loadHeaderData() {
      try {
        const [userResponse, categoriesResponse] = await Promise.all([
          fetch("/api/auth/me", {
            cache: "no-store",
          }),

          fetch("/api/categories", {
            cache: "no-store",
          }),
        ]);

        const [userResult, categoriesResult] = await Promise.all([
          userResponse.json(),
          categoriesResponse.json(),
        ]);

        if (!active) {
          return;
        }

        if (userResult?.success) {
          setUserName(userResult.data?.name ?? null);
        }

        if (categoriesResult?.success && Array.isArray(categoriesResult.data)) {
          setCategories(
            categoriesResult.data.filter(
              (category: Category) => category.active !== false,
            ),
          );
        }
      } catch {
        if (!active) {
          return;
        }

        setUserName(null);
        setCategories([]);
      }
    }

    void loadHeaderData();

    return () => {
      active = false;
    };
  }, []);

  /* =========================================================
     MENU HELPERS
     ========================================================= */

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  function closeMegaMenu() {
    setMegaMenuOpen(false);
  }

  function toggleMobileMenu() {
    setMobileMenuOpen((current) => !current);
    setMegaMenuOpen(false);
  }

  return (
    <header
      className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_96%,transparent)] backdrop-blur-xl"
      onMouseLeave={closeMegaMenu}
    >
      {/* =====================================================
          TOP BAR
          ===================================================== */}

      <div className="flex w-full items-center justify-center bg-[var(--primary)] text-white">
        <span className="px-4 py-2 text-center text-xs font-bold">
          با عضویت در ابزار احمدی اولین ارسال را مهمان ما باش :)
        </span>
      </div>

      {/* =====================================================
          MAIN HEADER
          ===================================================== */}

      <div className="mx-auto flex h-[76px] max-w-[1500px] items-center gap-3 px-4 lg:px-6">
        {/* ===================================================
            MOBILE MENU BUTTON
            =================================================== */}

        <button
          type="button"
          onClick={toggleMobileMenu}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] lg:hidden"
          aria-label={mobileMenuOpen ? "بستن منو" : "باز کردن منو"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {mobileMenuOpen ? (
            <X size={20} strokeWidth={2.2} />
          ) : (
            <Menu size={20} strokeWidth={2.2} />
          )}
        </button>

        {/* ===================================================
            BRAND
            =================================================== */}

        <Link
          href="/"
          onClick={() => {
            closeMobileMenu();
            closeMegaMenu();
          }}
          aria-label="ابزار احمدی"
          className="group flex min-w-0 shrink-0 items-center gap-3"
        >
          {/* Logo */}

          <div className="relative size-12 shrink-0 sm:size-14">
            <Image
              src={
                isDark
                  ? "/images/logo/abzar-ahmadi-logo-dark.png"
                  : "/images/logo/abzar-ahmadi-logo-light.png"
              }
              alt="لوگوی ابزار احمدی"
              width={56}
              height={56}
              priority
              sizes="56px"
              className="size-full object-contain transition-transform duration-200 group-hover:scale-[1.04]"
            />
          </div>

          {/* Brand text */}

          <div className="hidden min-w-0 sm:block">
            <div className="text-[17px] font-black leading-none tracking-tight text-[var(--text)]">
              <span className="text-primary-500">ابزار</span> <span className="">احمدی</span>
            </div>

            <div className="mt-1.5 whitespace-nowrap text-[10px] font-bold leading-none text-[var(--muted)]">
              فروشگاه ابزار آلات ساختمانی
            </div>
          </div>
        </Link>

        {/* ===================================================
            DESKTOP NAVIGATION
            =================================================== */}

        <nav className="hidden items-center gap-1 xl:flex">
          {/* Products Mega Menu */}

          <div className="relative" onMouseEnter={() => setMegaMenuOpen(true)}>
            <button
              type="button"
              className={`flex h-11 items-center gap-2 rounded-xl px-4 text-xs font-black transition-colors ${
                megaMenuOpen
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
              }`}
              aria-expanded={megaMenuOpen}
              aria-haspopup="menu"
            >
              <Grid3X3 size={17} />

              <span>محصولات</span>

              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  megaMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {megaMenuOpen && (
              <div
                className="absolute right-0 top-[calc(100%+10px)] w-[min(850px,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl shadow-black/15"
                onMouseEnter={() => setMegaMenuOpen(true)}
                role="menu"
              >
                <div className="h-1 bg-[var(--primary)]" />

                <div className="p-6">
                  {/* Mega Menu Header */}

                  <div className="mb-5 flex items-center justify-between border-b border-[var(--border)] pb-5">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                        <Package size={20} />
                      </div>

                      <div>
                        <div className="text-sm font-black text-[var(--text)]">
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
                      className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/10"
                    >
                      همه محصولات
                      <ArrowLeft size={14} />
                    </Link>
                  </div>

                  {/* Categories */}

                  {categories.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-3">
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/products?category=${encodeURIComponent(
                            category.name,
                          )}`}
                          onClick={closeMegaMenu}
                          className="group flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-[var(--surface-2)]"
                          role="menuitem"
                        >
                          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--surface-2)] text-[var(--muted)] transition-colors group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)]">
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
                            className="shrink-0 text-[var(--muted)] opacity-0 transition-all group-hover:-translate-x-0.5 group-hover:opacity-100"
                          />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center text-xs font-bold text-[var(--muted)]">
                      هنوز دسته‌بندی‌ای ثبت نشده است.
                    </div>
                  )}

                  {/* Mega Menu Footer */}

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

          {/* Store */}

          <Link
            href="/products"
            className="flex h-11 items-center rounded-xl px-4 text-xs font-black text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          >
            فروشگاه
          </Link>

          {/* New Products */}

          <Link
            href="/products"
            className="flex h-11 items-center rounded-xl px-4 text-xs font-black text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          >
            جدیدترین محصولات
          </Link>
        </nav>

        {/* ===================================================
            ACTIONS
            =================================================== */}

        <div className="mr-auto flex items-center gap-2">
          {/* Search */}

          <Link
            href="/products"
            className="hidden h-11 w-64 items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-xs font-bold text-[var(--muted)] transition-colors hover:border-[var(--primary)] hover:text-[var(--text)] lg:flex"
          >
            <Search size={17} />

            <span>جستجوی محصول، برند یا SKU</span>
          </Link>

          {/* Theme */}

          <ThemeToggle />

          {/* Account */}

          <Link
            href="/account"
            className="btn btn-secondary !size-11 !shrink-0 !p-0 sm:!h-11 sm:!w-auto sm:!px-3"
            title={userName || "حساب کاربری"}
          >
            <UserRound size={18} />

            {userName && (
              <span className="hidden max-w-[110px] truncate text-xs font-bold sm:inline">
                {userName}
              </span>
            )}
          </Link>

          {/* Cart */}

          <Link
            href="/cart"
            className={`relative flex h-11 shrink-0 items-center gap-2 rounded-xl text-xs font-black transition-all ${
              count > 0
                ? "bg-[var(--primary)] px-3 text-white shadow-lg shadow-[var(--primary)]/20"
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

      {/* =====================================================
          MOBILE NAVIGATION
          ===================================================== */}

      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-[var(--border)] bg-[var(--surface)] shadow-xl lg:hidden"
        >
          <div className="mx-auto max-w-[1500px] p-4">
            {/* Mobile Brand */}

            <Link
              href="/"
              onClick={closeMobileMenu}
              className="mb-4 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3"
            >
              <div className="relative size-12 shrink-0">
                <Image
                  src={
                    isDark
                      ? "/images/logo/abzar-ahmadi-logo-dark.png"
                      : "/images/logo/abzar-ahmadi-logo-light.png"
                  }
                  alt="لوگوی ابزار احمدی"
                  width={48}
                  height={48}
                  sizes="48px"
                  className="size-full object-contain"
                />
              </div>

              <div className="min-w-0">
                <div className="text-sm font-black text-[var(--text)]">
                  ابزار احمدی
                </div>

                <div className="mt-1 text-[10px] font-bold text-[var(--muted)]">
                  فروشگاه ابزار آلات ساختمانی
                </div>
              </div>
            </Link>

            {/* Mobile Search */}

            <Link
              href="/products"
              onClick={closeMobileMenu}
              className="mb-3 flex h-12 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 text-xs font-bold text-[var(--muted)]"
            >
              <Search size={18} />
              جستجوی محصول، برند یا SKU
            </Link>

            {/* All Products */}

            <Link
              href="/products"
              onClick={closeMobileMenu}
              className="mb-2 flex items-center gap-3 rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-black text-white"
            >
              <Grid3X3 size={18} />

              <span>مشاهده همه محصولات</span>

              <ArrowLeft className="mr-auto" size={17} />
            </Link>

            {/* Mobile Categories */}

            <div className="grid gap-1">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${encodeURIComponent(
                    category.name,
                  )}`}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3.5 text-sm font-bold transition-colors hover:bg-[var(--surface-2)]"
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

            {/* Mobile Cart Summary */}

            {count > 0 && (
              <Link
                href="/cart"
                onClick={closeMobileMenu}
                className="mt-3 block rounded-2xl bg-[var(--surface-2)] p-4"
              >
                <div className="flex items-center gap-2 text-xs font-black text-[var(--text)]">
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