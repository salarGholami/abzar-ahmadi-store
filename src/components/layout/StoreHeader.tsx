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
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

import ThemeToggle from "../ui/ThemeToggle";
import { useCart } from "@/lib/cart-context";
import type { Category } from "@/lib/types";

export default function StoreHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDark, setIsDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { count, subtotal } = useCart();

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/products?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/products");
    }
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  };

  /* Theme observer */
  useEffect(() => {
    const root = document.documentElement;
    const updateTheme = () => setIsDark(root.classList.contains("dark"));
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  /* Scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Load data */
  useEffect(() => {
    let active = true;
    async function loadHeaderData() {
      try {
        const [userResponse, categoriesResponse] = await Promise.all([
          fetch("/api/auth/me", { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }),
        ]);
        const [userResult, categoriesResult] = await Promise.all([
          userResponse.json(),
          categoriesResponse.json(),
        ]);
        if (!active) return;
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
        if (!active) return;
        setUserName(null);
        setCategories([]);
      }
    }
    loadHeaderData();
    return () => {
      active = false;
    };
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const closeMegaMenu = () => setMegaMenuOpen(false);

  /* Lock body scroll while mobile menu is open */
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  const logoSrc = isDark
    ? "/images/logo/abzar-ahmadi-logo-dark.png"
    : "/images/logo/abzar-ahmadi-logo-light.png";

  const mobileDrawer =
    mobileMenuOpen &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        className="fixed inset-0 z-[100] lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="منوی موبایل"
      >
        {/* Backdrop — covers full screen */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={closeMobileMenu}
          aria-hidden
        />

        {/* Side panel */}
        <div className="absolute inset-y-0 right-0 flex w-[min(100%,340px)] max-w-full flex-col bg-[var(--surface)] shadow-2xl">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] px-4">
            <span className="text-sm font-black">منو</span>
            <button
              type="button"
              onClick={closeMobileMenu}
              className="grid size-10 place-items-center rounded-xl bg-[var(--surface-2)] text-[var(--muted)]"
              aria-label="بستن"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain p-4">
            <form
              onSubmit={submitSearch}
              className="mb-3 flex h-12 items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 focus-within:border-[var(--primary)]/50 focus-within:ring-2 focus-within:ring-[var(--primary)]/15"
            >
              <Search size={18} className="shrink-0 text-[var(--muted)]" />
              <input
                ref={mobileSearchRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی محصول، برند یا SKU..."
                className="h-full w-full min-w-0 bg-transparent text-xs font-bold text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
                autoComplete="off"
                enterKeyHint="search"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    mobileSearchRef.current?.focus();
                  }}
                  className="grid size-8 shrink-0 place-items-center rounded-lg text-[var(--muted)]"
                  aria-label="پاک کردن"
                >
                  <X size={16} />
                </button>
              ) : null}
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-[var(--primary)] px-3 py-1.5 text-[11px] font-black text-white"
              >
                برو
              </button>
            </form>

            <Link
              href="/products"
              onClick={closeMobileMenu}
              className="mb-4 flex items-center gap-3 rounded-2xl bg-[var(--primary)] px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-[var(--primary)]/20"
            >
              <Grid3X3 size={18} />
              <span>مشاهده همه محصولات</span>
              <ArrowLeft className="mr-auto" size={17} />
            </Link>

            <div className="mb-2 text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
              دسته‌بندی‌ها
            </div>
            <div className="grid gap-1">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${encodeURIComponent(category.name)}`}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition hover:bg-[var(--surface-2)]"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--surface-2)] text-[var(--muted)]">
                    <Package size={16} />
                  </span>
                  <span className="truncate">{category.name}</span>
                  <ArrowLeft size={14} className="mr-auto text-[var(--muted)]" />
                </Link>
              ))}
            </div>

            {count > 0 && (
              <Link
                href="/cart"
                onClick={closeMobileMenu}
                className="mt-4 block rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-4"
              >
                <div className="flex items-center gap-2 text-xs font-black text-[var(--primary)]">
                  <ShoppingCart size={17} />
                  سبد خرید
                </div>
                <div className="mt-1.5 text-[11px] font-bold text-[var(--muted)]">
                  {count.toLocaleString("fa-IR")} عدد ·{" "}
                  {subtotal.toLocaleString("fa-IR")} تومان
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>,
      document.body,
    );

  return (
    <header
      className={`
        sticky top-0 z-40
        border-b border-[var(--border)]
        transition-all duration-300
        ${
          scrolled
            ? "bg-[var(--surface)]/90 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
            : "bg-[var(--surface)]/95 backdrop-blur-md"
        }
      `}
    >
      {/* Top thin accent */}
      <div className="h-0.5 w-full bg-gradient-to-l from-[var(--primary)] via-[var(--primary)]/70 to-transparent" />

      <div className="relative mx-auto flex h-[4.25rem] max-w-[1500px] items-center gap-3 px-4 lg:gap-5 lg:px-6">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="grid size-11 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] transition active:scale-95 lg:hidden"
          aria-label="منو"
        >
          <Menu size={20} strokeWidth={2} />
        </button>

        {/* Mobile search toggle */}
        <button
          type="button"
          onClick={() => {
            setMobileSearchOpen(true);
            setTimeout(() => mobileSearchRef.current?.focus(), 50);
          }}
          className="grid size-11 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] transition active:scale-95 lg:hidden"
          aria-label="جستجو"
        >
          <Search size={18} strokeWidth={2} />
        </button>

        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 transition hover:opacity-90 active:scale-[0.98]"
        >
          <div className="relative h-10 w-[120px] sm:w-[140px]">
            <Image
              src={logoSrc}
              alt="ابزار احمدی"
              fill
              className="object-contain object-right"
              priority
              sizes="140px"
            />
          </div>
        </Link>

        {/* Mobile expandable search bar */}
        {mobileSearchOpen && (
          <div className="absolute inset-x-0 top-0 z-50 flex h-[4.25rem] items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-3 lg:hidden">
            <form
              onSubmit={submitSearch}
              className="flex h-11 flex-1 items-center gap-2 rounded-2xl border border-[var(--primary)]/40 bg-[var(--surface-2)] px-3 ring-2 ring-[var(--primary)]/15"
            >
              <Search size={18} className="shrink-0 text-[var(--primary)]" />
              <input
                ref={mobileSearchRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی محصول، برند یا SKU..."
                className="h-full w-full min-w-0 bg-transparent text-sm font-medium text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
                autoComplete="off"
                enterKeyHint="search"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="grid size-7 place-items-center rounded-lg text-[var(--muted)]"
                  aria-label="پاک کردن"
                >
                  <X size={14} />
                </button>
              )}
            </form>
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="grid size-11 shrink-0 place-items-center rounded-2xl text-xs font-black text-[var(--muted)]"
            >
              بستن
            </button>
          </div>
        )}

        {/* Desktop search — real input */}
        <form
          onSubmit={submitSearch}
          className="
            group relative hidden h-11 flex-1 items-center gap-3
            rounded-2xl border border-[var(--border)]
            bg-[var(--surface-2)] px-4
            transition-all duration-200
            focus-within:border-[var(--primary)]/50 focus-within:bg-[var(--surface)]
            focus-within:ring-2 focus-within:ring-[var(--primary)]/15
            hover:border-[var(--primary)]/40
            lg:flex
          "
        >
          <Search
            size={18}
            className="shrink-0 text-[var(--muted)] transition group-focus-within:text-[var(--primary)]"
          />
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی محصول، برند یا SKU..."
            className="
              h-full w-full min-w-0 bg-transparent text-sm font-medium
              text-[var(--text)] outline-none placeholder:text-[var(--muted)]
            "
            autoComplete="off"
            enterKeyHint="search"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                searchInputRef.current?.focus();
              }}
              className="grid size-7 shrink-0 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
              aria-label="پاک کردن"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="submit"
            className="
              mr-0.5 hidden shrink-0 rounded-xl bg-[var(--primary)] px-3 py-1.5
              text-[11px] font-black text-white transition
              hover:bg-[var(--primary-2)] active:scale-95
              xl:inline-flex
            "
          >
            جستجو
          </button>
        </form>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          <div className="relative">
            <button
              type="button"
              onClick={() => setMegaMenuOpen((v) => !v)}
              onBlur={() => setTimeout(closeMegaMenu, 150)}
              className={`
                flex h-11 items-center gap-2 rounded-2xl px-4 text-xs font-black
                transition-all duration-200
                ${
                  megaMenuOpen
                    ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/25"
                    : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                }
              `}
            >
              <Grid3X3 size={16} />
              دسته‌بندی‌ها
              <ChevronDown
                size={14}
                className={`transition-transform ${megaMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {megaMenuOpen && (
              <div
                className="
                  absolute right-0 top-[calc(100%+0.5rem)] z-50
                  w-[min(92vw,560px)] overflow-hidden
                  rounded-3xl border border-[var(--border)]
                  bg-[var(--surface)] shadow-2xl shadow-black/10
                  dark:shadow-black/40
                "
                role="menu"
              >
                <div className="h-1 bg-gradient-to-l from-[var(--primary)] to-[var(--primary)]/40" />
                <div className="p-5">
                  <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
                        <Package size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-black">دسته‌بندی محصولات</div>
                        <div className="mt-0.5 text-[11px] text-[var(--muted)]">
                          انتخاب از دسته‌بندی‌ها
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/products"
                      onClick={closeMegaMenu}
                      className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-black text-[var(--primary)] hover:bg-[var(--primary)]/10"
                    >
                      همه
                      <ArrowLeft size={13} />
                    </Link>
                  </div>

                  {categories.length > 0 ? (
                    <div className="grid grid-cols-2 gap-1.5 md:grid-cols-3">
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/products?category=${encodeURIComponent(category.name)}`}
                          onClick={closeMegaMenu}
                          className="group flex items-center gap-2.5 rounded-2xl p-2.5 transition hover:bg-[var(--surface-2)]"
                          role="menuitem"
                        >
                          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--surface-2)] text-[var(--muted)] transition group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)]">
                            <Package size={15} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-black">
                              {category.name}
                            </div>
                          </div>
                          <ArrowLeft
                            size={13}
                            className="shrink-0 text-[var(--muted)] opacity-0 transition group-hover:opacity-100"
                          />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs font-bold text-[var(--muted)]">
                      هنوز دسته‌بندی‌ای ثبت نشده است.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Link
            href="/products"
            className="flex h-11 items-center rounded-2xl px-4 text-xs font-black text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          >
            فروشگاه
          </Link>
          <Link
            href="/products?sort=newest"
            className="flex h-11 items-center gap-1.5 rounded-2xl px-4 text-xs font-black text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          >
            <Sparkles size={14} className="text-[var(--primary)]" />
            جدیدترین
          </Link>
        </nav>

        {/* Actions */}
        <div className="mr-auto flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />

          <Link
            href="/account"
            className="
              relative flex h-11 items-center gap-2 rounded-2xl
              border border-[var(--border)] bg-[var(--surface-2)]
              px-3 text-xs font-bold text-[var(--text)]
              transition hover:border-[var(--primary)]/40 hover:bg-[var(--surface)]
              active:scale-95
            "
          >
            <UserRound size={18} strokeWidth={1.9} />
            <span className="hidden max-w-[80px] truncate sm:inline">
              {userName ?? "ورود"}
            </span>
          </Link>

          <Link
            href="/cart"
            className="
              relative flex h-11 items-center gap-2 rounded-2xl
              bg-[var(--primary)] px-3.5 text-xs font-black text-white
              shadow-md shadow-[var(--primary)]/25
              transition hover:bg-[var(--primary-2)] active:scale-95
            "
          >
            <ShoppingCart size={18} strokeWidth={2} />
            <span className="hidden sm:inline">سبد</span>
            {count > 0 && (
              <span className="absolute -left-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[10px] font-black leading-none text-white ring-2 ring-[var(--surface)]">
                {count > 99 ? "۹۹+" : count.toLocaleString("fa-IR")}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile drawer rendered on document.body */}
      {mobileDrawer}
    </header>
  );
}
