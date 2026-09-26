"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpLeft,
  ChevronDown,
  ChevronLeft,
  CircleUserRound,
  ClipboardList,
  Flame,
  Grid2X2,
  Headphones,
  LogIn,
  Menu,
  Package,
  Percent,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

import ThemeToggle from "../ui/ThemeToggle";
import { useCart } from "@/lib/cart-context";
import type { Category } from "@/lib/types";

/* ============================================================================
   STORE HEADER
============================================================================ */

export default function StoreHeader() {
  const router = useRouter();
  const { count } = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [userName, setUserName] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [desktopCategoriesOpen, setDesktopCategoriesOpen] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  /* ==========================================================================
     THEME
  ========================================================================== */

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

    return () => observer.disconnect();
  }, []);

  /* ==========================================================================
     SCROLL
  ========================================================================== */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* ==========================================================================
     DATA
  ========================================================================== */

  useEffect(() => {
    let mounted = true;

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

        const userResult = await userResponse.json();
        const categoriesResult = await categoriesResponse.json();

        if (!mounted) return;

        if (userResult?.success) {
          setUserName(userResult.data?.name ?? null);
        } else {
          setUserName(null);
        }

        if (categoriesResult?.success && Array.isArray(categoriesResult.data)) {
          setCategories(
            categoriesResult.data.filter(
              (category: Category) => category.active !== false,
            ),
          );
        } else {
          setCategories([]);
        }
      } catch {
        if (!mounted) return;

        setUserName(null);
        setCategories([]);
      }
    }

    loadHeaderData();

    return () => {
      mounted = false;
    };
  }, []);

  /* ==========================================================================
     BODY LOCK
  ========================================================================== */

  useEffect(() => {
    if (!mobileMenuOpen && !mobileSearchOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen, mobileSearchOpen]);

  /* ==========================================================================
     ESC
  ========================================================================== */

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      setDesktopCategoriesOpen(false);
      setMobileMenuOpen(false);
      setMobileSearchOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /* ==========================================================================
     SEARCH
  ========================================================================== */

  const submitSearch = (event?: React.FormEvent) => {
    event?.preventDefault();

    const query = searchQuery.trim();

    if (query) {
      router.push(`/products?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/products");
    }

    setDesktopCategoriesOpen(false);
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  };

  const clearSearch = () => {
    setSearchQuery("");

    requestAnimationFrame(() => {
      desktopSearchRef.current?.focus();
    });
  };

  /* ==========================================================================
     CLOSE
  ========================================================================== */

  const closeAll = () => {
    setDesktopCategoriesOpen(false);
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  };

  const openMobileSearch = () => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(true);

    window.setTimeout(() => {
      mobileSearchRef.current?.focus();
    }, 120);
  };

  /* ==========================================================================
     LOGO
  ========================================================================== */

  const logoSrc = isDark
    ? "/images/logo/abzar-ahmadi-logo-dark.png"
    : "/images/logo/abzar-ahmadi-logo-light.png";

  /* ==========================================================================
     MOBILE MENU
  ========================================================================== */

  const mobileMenu =
    mobileMenuOpen &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        dir="rtl"
        className="fixed inset-0 z-[100] overflow-hidden lg:hidden"
      >
        {/* BACKDROP */}

        <button
          type="button"
          aria-label="بستن منو"
          onClick={() => setMobileMenuOpen(false)}
          className="
            absolute inset-0
            h-full w-full
            bg-black/70
            backdrop-blur-md
          "
        />

        {/* MAIN SHEET */}

        <div
          className="
            absolute inset-x-0 bottom-0
            flex h-[96dvh]
            flex-col
            overflow-hidden
            rounded-t-[34px]
            border-t
            border-[var(--border)]
            bg-[var(--surface)]
            shadow-[0_-30px_100px_rgba(0,0,0,0.30)]
            animate-[mobileMenuIn_.32s_cubic-bezier(.22,1,.36,1)]
          "
        >
          {/* ================================================================
             TOP HANDLE
          ================================================================= */}

          <div className="flex shrink-0 justify-center pt-2.5">
            <span
              className="
                h-1 w-11
                rounded-full
                bg-[var(--border)]
              "
            />
          </div>

          {/* ================================================================
             HEADER
          ================================================================= */}

          <div
            className="
              flex shrink-0
              items-center justify-between
              px-5 pb-4 pt-3
            "
          >
            <Link
              href="/"
              onClick={closeAll}
              className="flex items-center gap-3"
            >
              <div
                className="
                  relative grid size-11
                  shrink-0 place-items-center
                  overflow-hidden rounded-[15px]
                  bg-[var(--primary)]/10
                "
              >
                <Image
                  src={logoSrc}
                  alt="لوگوی ابزار احمدی"
                  fill
                  sizes="44px"
                  className="object-contain p-1.5"
                />
              </div>

              <div>
                <div
                  className="
                    text-[13px]
                    font-black
                    tracking-tight
                    text-[var(--text)]
                  "
                >
                  ابزار احمدی
                </div>

                <div
                  className="
                    mt-0.5
                    text-[8px]
                    font-bold
                    text-[var(--muted)]
                  "
                >
                  ابزار حرفه‌ای برای حرفه‌ای‌ها
                </div>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="بستن منو"
              className="
                grid size-10
                place-items-center
                rounded-2xl
                border
                border-[var(--border)]
                bg-[var(--surface-2)]
                text-[var(--muted)]
                transition
                hover:border-[var(--primary)]/30
                hover:text-[var(--primary)]
                active:scale-95
              "
            >
              <X size={18} />
            </button>
          </div>

          {/* ================================================================
             CONTENT
          ================================================================= */}

          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              overscroll-contain
              px-4 pb-10
            "
          >
            {/* ============================================================
               ACCOUNT CARD
            ============================================================= */}

            <Link
              href="/account"
              onClick={closeAll}
              className="
                group
                relative
                block
                overflow-hidden
                rounded-[26px]
                border
                border-[var(--border)]
                bg-[var(--surface-2)]
                p-4
                transition
                active:scale-[0.99]
              "
            >
              {/* Decorative glow */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -left-12
                  -top-16
                  size-36
                  rounded-full
                  bg-[var(--primary)]/10
                  blur-2xl
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  -bottom-20
                  right-10
                  size-32
                  rounded-full
                  bg-[var(--primary)]/5
                  blur-2xl
                "
              />

              <div className="relative flex items-center gap-3">
                <div
                  className="
                    grid size-12
                    shrink-0
                    place-items-center
                    rounded-[17px]
                    bg-[var(--primary)]/10
                    text-[var(--primary)]
                  "
                >
                  {userName ? (
                    <CircleUserRound size={22} />
                  ) : (
                    <LogIn size={21} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div
                    className="
                      truncate
                      text-[12px]
                      font-black
                      text-[var(--text)]
                    "
                  >
                    {userName ? `سلام ${userName} 👋` : "خوش اومدی 👋"}
                  </div>

                  <div
                    className="
                      mt-1
                      text-[9px]
                      font-bold
                      text-[var(--muted)]
                    "
                  >
                    {userName
                      ? "حساب کاربری و سفارش‌های خودت را ببین"
                      : "برای مشاهده سفارش‌ها وارد حساب شو"}
                  </div>
                </div>

                <span
                  className="
                    grid size-9
                    place-items-center
                    rounded-xl
                    bg-[var(--surface)]
                    text-[var(--muted)]
                    transition
                    group-hover:text-[var(--primary)]
                  "
                >
                  <ChevronLeft size={15} />
                </span>
              </div>
            </Link>

            {/* ============================================================
               SEARCH
            ============================================================= */}

            <button
              type="button"
              onClick={openMobileSearch}
              className="
                group
                relative
                mt-3
                flex h-[58px]
                w-full
                items-center
                gap-3
                overflow-hidden
                rounded-[20px]
                border
                border-[var(--primary)]/20
                bg-[var(--surface-2)]
                px-3
                text-right
                transition
                hover:border-[var(--primary)]/40
                active:scale-[0.99]
              "
            >
              <div
                className="
                  absolute
                  inset-y-0
                  right-0
                  w-24
                  bg-gradient-to-l
                  from-[var(--primary)]/8
                  to-transparent
                "
              />

              <span
                className="
                  relative
                  grid size-10
                  shrink-0
                  place-items-center
                  rounded-[14px]
                  bg-[var(--primary)]
                  text-white
                  shadow-lg
                  shadow-[var(--primary)]/20
                "
              >
                <Search size={17} />
              </span>

              <span className="relative min-w-0 flex-1">
                <span
                  className="
                    block
                    text-[10px]
                    font-black
                    text-[var(--text)]
                  "
                >
                  دنبال چه ابزاری هستی؟
                </span>

                <span
                  className="
                    mt-0.5
                    block
                    truncate
                    text-[8px]
                    font-medium
                    text-[var(--muted)]
                  "
                >
                  نام محصول، برند یا کد کالا...
                </span>
              </span>

              <span
                className="
                  relative
                  grid size-8
                  place-items-center
                  rounded-xl
                  bg-[var(--surface)]
                  text-[var(--muted)]
                "
              >
                <ArrowUpLeft size={14} />
              </span>
            </button>

            {/* ============================================================
               QUICK ACTIONS
            ============================================================= */}

            <section className="mt-7">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div
                    className="
                      text-[11px]
                      font-black
                      text-[var(--text)]
                    "
                  >
                    دسترسی سریع
                  </div>

                  <div
                    className="
                      mt-1
                      text-[8px]
                      font-bold
                      text-[var(--muted)]
                    "
                  >
                    کارهای پرتکرار
                  </div>
                </div>

                {count > 0 && (
                  <div
                    className="
                      flex items-center gap-1
                      rounded-full
                      bg-[var(--primary)]/10
                      px-2.5 py-1.5
                      text-[8px]
                      font-black
                      text-[var(--primary)]
                    "
                  >
                    <ShoppingBag size={11} />
                    {count.toLocaleString("fa-IR")} کالا
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* STORE */}

                <Link
                  href="/products"
                  onClick={closeAll}
                  className="
                    group
                    relative
                    min-h-[112px]
                    overflow-hidden
                    rounded-[24px]
                    bg-[var(--primary)]
                    p-4
                    text-white
                    shadow-xl
                    shadow-[var(--primary)]/15
                    transition
                    active:scale-[0.98]
                  "
                >
                  <div
                    className="
                      absolute
                      -left-8
                      -top-8
                      size-28
                      rounded-full
                      bg-white/10
                    "
                  />

                  <div className="relative flex h-full flex-col">
                    <span
                      className="
                        grid size-10
                        place-items-center
                        rounded-[14px]
                        bg-white/15
                      "
                    >
                      <ShoppingBag size={19} />
                    </span>

                    <div className="mt-auto">
                      <div className="text-[11px] font-black">فروشگاه</div>

                      <div className="mt-0.5 text-[8px] font-medium text-white/65">
                        مشاهده همه محصولات
                      </div>
                    </div>
                  </div>
                </Link>

                {/* CART */}

                <Link
                  href="/cart"
                  onClick={closeAll}
                  className="
                    group
                    relative
                    min-h-[112px]
                    overflow-hidden
                    rounded-[24px]
                    border
                    border-[var(--border)]
                    bg-[var(--surface-2)]
                    p-4
                    transition
                    active:scale-[0.98]
                  "
                >
                  <span
                    className="
                      grid size-10
                      place-items-center
                      rounded-[14px]
                      bg-[var(--primary)]/10
                      text-[var(--primary)]
                    "
                  >
                    <ShoppingBag size={19} />
                  </span>

                  <div className="mt-5">
                    <div
                      className="
                        text-[11px]
                        font-black
                        text-[var(--text)]
                      "
                    >
                      سبد خرید
                    </div>

                    <div
                      className="
                        mt-0.5
                        text-[8px]
                        font-medium
                        text-[var(--muted)]
                      "
                    >
                      مشاهده و تکمیل خرید
                    </div>
                  </div>

                  {count > 0 && (
                    <span
                      className="
                        absolute
                        left-3
                        top-3
                        grid
                        h-6
                        min-w-6
                        place-items-center
                        rounded-full
                        bg-[var(--danger)]
                        px-1.5
                        text-[8px]
                        font-black
                        text-white
                        ring-4
                        ring-[var(--surface-2)]
                      "
                    >
                      {count > 99 ? "۹۹+" : count.toLocaleString("fa-IR")}
                    </span>
                  )}
                </Link>

                {/* ORDERS */}

                <Link
                  href="/account/orders"
                  onClick={closeAll}
                  className="
                    group
                    flex
                    min-h-[86px]
                    items-center
                    gap-3
                    rounded-[22px]
                    border
                    border-[var(--border)]
                    bg-[var(--surface-2)]
                    px-4
                    transition
                    active:scale-[0.98]
                  "
                >
                  <span
                    className="
                      grid size-10
                      shrink-0
                      place-items-center
                      rounded-[14px]
                      bg-blue-500/10
                      text-blue-500
                    "
                  >
                    <ClipboardList size={18} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className="
                        block
                        text-[10px]
                        font-black
                        text-[var(--text)]
                      "
                    >
                      سفارش‌های من
                    </span>

                    <span
                      className="
                        mt-1
                        block
                        text-[8px]
                        font-bold
                        text-[var(--muted)]
                      "
                    >
                      پیگیری سفارش
                    </span>
                  </span>

                  <ChevronLeft size={14} className="text-[var(--muted)]" />
                </Link>

                {/* NEW */}

                <Link
                  href="/products?sort=newest"
                  onClick={closeAll}
                  className="
                    group
                    flex
                    min-h-[86px]
                    items-center
                    gap-3
                    rounded-[22px]
                    border
                    border-[var(--border)]
                    bg-[var(--surface-2)]
                    px-4
                    transition
                    active:scale-[0.98]
                  "
                >
                  <span
                    className="
                      grid size-10
                      shrink-0
                      place-items-center
                      rounded-[14px]
                      bg-purple-500/10
                      text-purple-500
                    "
                  >
                    <Sparkles size={18} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className="
                        block
                        text-[10px]
                        font-black
                        text-[var(--text)]
                      "
                    >
                      تازه‌ها
                    </span>

                    <span
                      className="
                        mt-1
                        block
                        text-[8px]
                        font-bold
                        text-[var(--muted)]
                      "
                    >
                      جدیدترین محصولات
                    </span>
                  </span>

                  <ChevronLeft size={14} className="text-[var(--muted)]" />
                </Link>
              </div>
            </section>

            {/* ============================================================
               CATEGORY HORIZONTAL SCROLLER
            ============================================================= */}

            <section className="mt-8">
              <div className="mb-3 flex items-end justify-between">
                <div>
                  <div
                    className="
                      flex items-center gap-2
                      text-[11px]
                      font-black
                      text-[var(--text)]
                    "
                  >
                    <span
                      className="
                        grid size-7
                        place-items-center
                        rounded-lg
                        bg-[var(--primary)]/10
                        text-[var(--primary)]
                      "
                    >
                      <Grid2X2 size={13} />
                    </span>
                    دسته‌بندی ابزارها
                  </div>

                  <div
                    className="
                      mt-1
                      text-[8px]
                      font-bold
                      text-[var(--muted)]
                    "
                  >
                    سریع وارد دسته مورد نظر شو
                  </div>
                </div>

                <Link
                  href="/products"
                  onClick={closeAll}
                  className="
                    flex items-center gap-1
                    text-[8px]
                    font-black
                    text-[var(--primary)]
                  "
                >
                  همه
                  <ChevronLeft size={12} />
                </Link>
              </div>

              {categories.length > 0 ? (
                <div
                  className="
                    -mx-4
                    flex
                    gap-2.5
                    overflow-x-auto
                    px-4
                    pb-2
                    scrollbar-none
                  "
                >
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/products?category=${encodeURIComponent(
                        category.name,
                      )}`}
                      onClick={closeAll}
                      className="
                        group
                        flex
                        w-[118px]
                        shrink-0
                        flex-col
                        rounded-[22px]
                        border
                        border-[var(--border)]
                        bg-[var(--surface-2)]
                        p-3
                        transition
                        active:scale-[0.97]
                      "
                    >
                      <span
                        className="
                          grid size-10
                          place-items-center
                          rounded-[14px]
                          bg-[var(--surface)]
                          text-[var(--muted)]
                          transition
                          group-hover:bg-[var(--primary)]/10
                          group-hover:text-[var(--primary)]
                        "
                      >
                        <Package size={17} />
                      </span>

                      <span
                        className="
                          mt-3
                          line-clamp-2
                          min-h-[28px]
                          text-[9px]
                          font-black
                          leading-4
                          text-[var(--text)]
                        "
                      >
                        {category.name}
                      </span>

                      <span
                        className="
                          mt-2
                          flex items-center gap-1
                          text-[7px]
                          font-bold
                          text-[var(--muted)]
                        "
                      >
                        مشاهده
                        <ChevronLeft size={10} />
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div
                  className="
                    rounded-[22px]
                    border
                    border-dashed
                    border-[var(--border)]
                    py-7
                    text-center
                    text-[9px]
                    font-bold
                    text-[var(--muted)]
                  "
                >
                  دسته‌بندی‌ای موجود نیست.
                </div>
              )}
            </section>

            {/* ============================================================
               DISCOVER
            ============================================================= */}

            <section className="mt-8">
              <div className="mb-3">
                <div
                  className="
                    text-[11px]
                    font-black
                    text-[var(--text)]
                  "
                >
                  کشف کن
                </div>

                <div
                  className="
                    mt-1
                    text-[8px]
                    font-bold
                    text-[var(--muted)]
                  "
                >
                  چیزی که امروز به کارت می‌آید
                </div>
              </div>

              <div className="space-y-2.5">
                {/* POPULAR */}

                <Link
                  href="/products?sort=popular"
                  onClick={closeAll}
                  className="
                    group
                    relative
                    flex
                    min-h-[78px]
                    items-center
                    gap-3
                    overflow-hidden
                    rounded-[22px]
                    border
                    border-[var(--border)]
                    bg-[var(--surface-2)]
                    px-4
                    transition
                    active:scale-[0.99]
                  "
                >
                  <div
                    className="
                      absolute
                      -left-8
                      top-1/2
                      size-24
                      -translate-y-1/2
                      rounded-full
                      bg-orange-500/5
                      blur-xl
                    "
                  />

                  <span
                    className="
                      relative
                      grid size-11
                      shrink-0
                      place-items-center
                      rounded-[15px]
                      bg-orange-500/10
                      text-orange-500
                    "
                  >
                    <Flame size={20} />
                  </span>

                  <span className="relative min-w-0 flex-1">
                    <span
                      className="
                        block
                        text-[10px]
                        font-black
                        text-[var(--text)]
                      "
                    >
                      پرفروش‌ترین‌ها
                    </span>

                    <span
                      className="
                        mt-1
                        block
                        text-[8px]
                        font-bold
                        text-[var(--muted)]
                      "
                    >
                      محصولاتی که بیشتر انتخاب شده‌اند
                    </span>
                  </span>

                  <span
                    className="
                      relative
                      grid size-8
                      place-items-center
                      rounded-xl
                      bg-[var(--surface)]
                      text-[var(--muted)]
                    "
                  >
                    <ChevronLeft size={14} />
                  </span>
                </Link>

                {/* DISCOUNT */}

                <Link
                  href="/products?discount=true"
                  onClick={closeAll}
                  className="
                    group
                    relative
                    flex
                    min-h-[78px]
                    items-center
                    gap-3
                    overflow-hidden
                    rounded-[22px]
                    border
                    border-[var(--border)]
                    bg-[var(--surface-2)]
                    px-4
                    transition
                    active:scale-[0.99]
                  "
                >
                  <span
                    className="
                      grid size-11
                      shrink-0
                      place-items-center
                      rounded-[15px]
                      bg-red-500/10
                      text-red-500
                    "
                  >
                    <Percent size={19} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className="
                        block
                        text-[10px]
                        font-black
                        text-[var(--text)]
                      "
                    >
                      پیشنهادهای ویژه
                    </span>

                    <span
                      className="
                        mt-1
                        block
                        text-[8px]
                        font-bold
                        text-[var(--muted)]
                      "
                    >
                      تخفیف‌های فعال فروشگاه
                    </span>
                  </span>

                  <span
                    className="
                      grid size-8
                      place-items-center
                      rounded-xl
                      bg-[var(--surface)]
                      text-[var(--muted)]
                    "
                  >
                    <ChevronLeft size={14} />
                  </span>
                </Link>
              </div>
            </section>

            {/* ============================================================
               SERVICE STRIP
            ============================================================= */}

            <section className="mt-7">
              <div
                className="
                  grid grid-cols-3
                  overflow-hidden
                  rounded-[22px]
                  border
                  border-[var(--border)]
                  bg-[var(--surface-2)]
                "
              >
                <div
                  className="
                    flex flex-col
                    items-center
                    gap-2
                    border-l
                    border-[var(--border)]
                    px-2
                    py-4
                    text-center
                  "
                >
                  <span
                    className="
                      grid size-9
                      place-items-center
                      rounded-xl
                      bg-[var(--primary)]/10
                      text-[var(--primary)]
                    "
                  >
                    <ShieldCheck size={16} />
                  </span>

                  <span
                    className="
                      text-[7px]
                      font-black
                      text-[var(--muted)]
                    "
                  >
                    اصالت کالا
                  </span>
                </div>

                <div
                  className="
                    flex flex-col
                    items-center
                    gap-2
                    border-l
                    border-[var(--border)]
                    px-2
                    py-4
                    text-center
                  "
                >
                  <span
                    className="
                      grid size-9
                      place-items-center
                      rounded-xl
                      bg-[var(--primary)]/10
                      text-[var(--primary)]
                    "
                  >
                    <Truck size={16} />
                  </span>

                  <span
                    className="
                      text-[7px]
                      font-black
                      text-[var(--muted)]
                    "
                  >
                    ارسال سریع
                  </span>
                </div>

                <div
                  className="
                    flex flex-col
                    items-center
                    gap-2
                    px-2
                    py-4
                    text-center
                  "
                >
                  <span
                    className="
                      grid size-9
                      place-items-center
                      rounded-xl
                      bg-[var(--primary)]/10
                      text-[var(--primary)]
                    "
                  >
                    <Headphones size={16} />
                  </span>

                  <span
                    className="
                      text-[7px]
                      font-black
                      text-[var(--muted)]
                    "
                  >
                    پشتیبانی
                  </span>
                </div>
              </div>
            </section>

            {/* BOTTOM BRAND */}

            <div className="mt-8 text-center">
              <div
                className="
                  text-[9px]
                  font-black
                  text-[var(--muted)]
                "
              >
                ابزار احمدی
              </div>

              <div
                className="
                  mt-1
                  text-[7px]
                  font-bold
                  text-[var(--muted)]/60
                "
              >
                ابزار حرفه‌ای برای کار حرفه‌ای
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body,
    );

  /* ==========================================================================
     MOBILE SEARCH
  ========================================================================== */

  const mobileSearch =
    mobileSearchOpen &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        dir="rtl"
        className="
          fixed inset-0
          z-[110]
          bg-[var(--surface)]
          lg:hidden
        "
      >
        <div className="flex h-full flex-col">
          {/* SEARCH HEADER */}

          <div
            className="
              flex h-[76px]
              shrink-0
              items-center
              gap-2
              border-b
              border-[var(--border)]
              px-3
            "
          >
            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen(false);
                setMobileMenuOpen(true);
              }}
              className="
                grid size-11
                shrink-0
                place-items-center
                rounded-xl
                text-[var(--muted)]
                transition
                hover:text-[var(--text)]
              "
              aria-label="بازگشت"
            >
              <ArrowLeft size={20} />
            </button>

            <form
              onSubmit={submitSearch}
              className="
                flex h-12
                min-w-0 flex-1
                items-center gap-2
                rounded-2xl
                border
                border-[var(--primary)]/40
                bg-[var(--surface-2)]
                px-3
                ring-4
                ring-[var(--primary)]/5
              "
            >
              <Search size={18} className="shrink-0 text-[var(--primary)]" />

              <input
                ref={mobileSearchRef}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                type="search"
                placeholder="جستجوی محصول، برند یا کد کالا..."
                className="
                  min-w-0 flex-1
                  bg-transparent
                  text-sm
                  font-bold
                  text-[var(--text)]
                  outline-none
                  placeholder:text-[var(--muted)]
                "
                autoFocus
                autoComplete="off"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="
                    grid size-7
                    place-items-center
                    rounded-lg
                    text-[var(--muted)]
                  "
                  aria-label="پاک کردن"
                >
                  <X size={14} />
                </button>
              )}
            </form>
          </div>

          {/* SEARCH CONTENT */}

          <div className="flex-1 overflow-y-auto p-5">
            <div
              className="
                mb-5
                flex items-center gap-2
                text-xs
                font-black
                text-[var(--text)]
              "
            >
              <Search size={15} className="text-[var(--primary)]" />
              جستجوی سریع
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/products?sort=newest"
                onClick={closeAll}
                className="
                  rounded-[22px]
                  border
                  border-[var(--border)]
                  bg-[var(--surface-2)]
                  p-4
                  transition
                  active:scale-[0.98]
                "
              >
                <Sparkles size={19} className="text-[var(--primary)]" />

                <div
                  className="
                    mt-3
                    text-xs
                    font-black
                    text-[var(--text)]
                  "
                >
                  جدیدترین‌ها
                </div>
              </Link>

              <Link
                href="/products?sort=popular"
                onClick={closeAll}
                className="
                  rounded-[22px]
                  border
                  border-[var(--border)]
                  bg-[var(--surface-2)]
                  p-4
                  transition
                  active:scale-[0.98]
                "
              >
                <Flame size={19} className="text-orange-500" />

                <div
                  className="
                    mt-3
                    text-xs
                    font-black
                    text-[var(--text)]
                  "
                >
                  پرفروش‌ها
                </div>
              </Link>
            </div>

            <div className="mt-7">
              <div
                className="
                  mb-3
                  text-xs
                  font-black
                  text-[var(--text)]
                "
              >
                دسته‌بندی‌ها
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${encodeURIComponent(
                      category.name,
                    )}`}
                    onClick={closeAll}
                    className="
                      rounded-full
                      border
                      border-[var(--border)]
                      bg-[var(--surface-2)]
                      px-3.5
                      py-2.5
                      text-[9px]
                      font-black
                      text-[var(--text)]
                      transition
                      active:scale-95
                    "
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body,
    );

  /* ==========================================================================
     HEADER
  ========================================================================== */

  return (
    <>
      <header
        dir="rtl"
        className={[
          "sticky top-0 z-40 w-full",
          "border-b border-[var(--border)]",
          "transition-all duration-300",
          scrolled
            ? "bg-[var(--surface)]/92 shadow-[0_10px_40px_rgba(0,0,0,0.07)] backdrop-blur-2xl dark:shadow-[0_10px_40px_rgba(0,0,0,0.28)]"
            : "bg-[var(--surface)]",
        ].join(" ")}
      >
        {/* ACCENT */}

        <div
          className="
            h-[3px]
            bg-gradient-to-l
            from-[var(--primary)]
            via-[var(--primary)]/70
            to-transparent
          "
        />

        {/* ==================================================================
           DESKTOP
        ================================================================== */}

        <div className="hidden lg:block">
          {/* MAIN ROW */}

          <div
            className="
              mx-auto flex
              min-h-[88px]
              max-w-[1500px]
              items-center
              gap-5
              px-4
              sm:px-6
              lg:px-8
              xl:gap-7
            "
          >
            {/* BRAND */}

            <Link
              href="/"
              className="
                flex
                w-[235px]
                shrink-0
                items-center
                gap-3
                transition-all
                duration-200
                hover:scale-[1.01]
              "
            >
              <div
                className="
                  relative
                  h-[60px]
                  w-[70px]
                  shrink-0
                "
              >
                <Image
                  src={logoSrc}
                  alt="لوگوی ابزار احمدی"
                  fill
                  priority
                  sizes="70px"
                  className="object-contain object-center"
                />
              </div>

              <div
                className="
                  flex min-w-0
                  flex-col
                  justify-center
                  text-right
                "
              >
                <div
                  className="
                    whitespace-nowrap
                    text-[21px]
                    font-black
                    leading-7
                    tracking-[-0.7px]
                  "
                >
                  <span className="text-[var(--primary)]">ابزار</span>{" "}
                  <span className="text-[var(--text)]">احمدی</span>
                </div>

                <span
                  className="
                    mt-1
                    whitespace-nowrap
                    text-[9px]
                    font-bold
                    leading-4
                    text-[var(--muted)]
                  "
                >
                  فروشگاه ابزار آلات ساختمانی
                </span>
              </div>
            </Link>

            {/* SEARCH */}

            <form
              onSubmit={submitSearch}
              className="
                group
                flex h-[56px]
                min-w-0 flex-1
                items-center gap-3
                rounded-[18px]
                border
                border-[var(--border)]
                bg-[var(--surface-2)]
                px-3.5
                transition-all
                duration-200
                hover:border-[var(--primary)]/30
                focus-within:border-[var(--primary)]/45
                focus-within:bg-[var(--surface)]
                focus-within:ring-4
                focus-within:ring-[var(--primary)]/5
              "
            >
              <span
                className="
                  grid size-9
                  shrink-0
                  place-items-center
                  rounded-xl
                  bg-[var(--surface)]
                  text-[var(--muted)]
                  transition
                  group-focus-within:bg-[var(--primary)]/10
                  group-focus-within:text-[var(--primary)]
                "
              >
                <Search size={18} />
              </span>

              <input
                ref={desktopSearchRef}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                type="search"
                placeholder="جستجو بین ابزارها، برندها و کد کالا..."
                className="
                  min-w-0 flex-1
                  bg-transparent
                  text-xs
                  font-bold
                  text-[var(--text)]
                  outline-none
                  placeholder:text-[var(--muted)]
                "
                autoComplete="off"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="
                    grid size-8
                    shrink-0
                    place-items-center
                    rounded-lg
                    text-[var(--muted)]
                    transition
                    hover:bg-[var(--surface)]
                    hover:text-[var(--text)]
                  "
                  aria-label="پاک کردن"
                >
                  <X size={15} />
                </button>
              )}

              <button
                type="submit"
                className="
                  flex h-10
                  shrink-0
                  items-center gap-2
                  rounded-xl
                  bg-[var(--primary)]
                  px-5
                  text-[10px]
                  font-black
                  text-white
                  shadow-lg
                  shadow-[var(--primary)]/15
                  transition
                  hover:bg-[var(--primary-2)]
                  active:scale-[0.97]
                "
              >
                <Search size={14} />
                جستجو
              </button>
            </form>

            {/* ACTIONS */}

            <div
              className="
                flex
                shrink-0
                items-center
                gap-2
              "
            >
              <ThemeToggle />

              <Link
                href="/account"
                className="
                  group
                  flex h-[52px]
                  items-center gap-2.5
                  rounded-2xl
                  border
                  border-[var(--border)]
                  bg-[var(--surface-2)]
                  px-3
                  transition
                  hover:border-[var(--primary)]/30
                  hover:bg-[var(--surface)]
                  active:scale-[0.98]
                "
              >
                <span
                  className="
                    grid size-9
                    place-items-center
                    rounded-xl
                    bg-[var(--surface)]
                    text-[var(--muted)]
                    transition
                    group-hover:bg-[var(--primary)]/10
                    group-hover:text-[var(--primary)]
                  "
                >
                  <UserRound size={16} />
                </span>

                <span className="hidden xl:block">
                  <span
                    className="
                      block
                      max-w-[100px]
                      truncate
                      text-[9px]
                      font-black
                      text-[var(--text)]
                    "
                  >
                    {userName ?? "حساب کاربری"}
                  </span>

                  <span
                    className="
                      mt-1 block
                      text-[8px]
                      text-[var(--muted)]
                    "
                  >
                    {userName ? "مشاهده حساب" : "ورود / ثبت‌نام"}
                  </span>
                </span>
              </Link>

              <Link
                href="/cart"
                className="
                  relative
                  flex h-[52px]
                  items-center gap-2
                  rounded-2xl
                  bg-[var(--primary)]
                  px-4
                  !text-white
                  shadow-lg
                  shadow-[var(--primary)]/20
                  transition
                  hover:bg-[var(--primary-2)]
                  hover:!text-white
                  active:scale-[0.98]
                "
              >
                <ShoppingBag size={18} className="!text-white" />

                <span
                  className="
                    hidden
                    text-[10px]
                    font-black
                    !text-white
                    xl:inline
                  "
                >
                  سبد خرید
                </span>

                {count > 0 && (
                  <span
                    className="
                      absolute
                      -left-1.5
                      -top-1.5
                      grid h-5
                      min-w-5
                      place-items-center
                      rounded-full
                      bg-[var(--danger)]
                      px-1
                      text-[8px]
                      font-black
                      !text-white
                      ring-2
                      ring-[var(--surface)]
                    "
                  >
                    {count > 99 ? "۹۹+" : count.toLocaleString("fa-IR")}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* SECOND ROW */}

          <div className="border-t border-[var(--border)]">
            <div
              className="
                mx-auto flex
                min-h-[52px]
                max-w-[1500px]
                items-center
                px-4
                sm:px-6
                lg:px-8
              "
            >
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDesktopCategoriesOpen((value) => !value)}
                  className={[
                    "flex h-10",
                    "items-center gap-2",
                    "rounded-xl px-4",
                    "text-[10px] font-black",
                    "transition",
                    desktopCategoriesOpen
                      ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/15"
                      : "bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]",
                  ].join(" ")}
                >
                  <Grid2X2 size={16} />
                  دسته‌بندی کالاها
                  <ChevronDown
                    size={14}
                    className={
                      desktopCategoriesOpen
                        ? "rotate-180 transition-transform"
                        : "transition-transform"
                    }
                  />
                </button>

                {desktopCategoriesOpen && (
                  <>
                    <button
                      type="button"
                      onClick={() => setDesktopCategoriesOpen(false)}
                      className="
                        fixed inset-0 z-40
                        cursor-default
                      "
                      aria-label="بستن دسته‌بندی"
                    />

                    <div
                      className="
                        absolute right-0
                        top-[calc(100%+10px)]
                        z-50
                        w-[720px]
                        overflow-hidden
                        rounded-[26px]
                        border
                        border-[var(--border)]
                        bg-[var(--surface)]
                        shadow-[0_25px_80px_rgba(0,0,0,0.18)]
                      "
                    >
                      <div
                        className="
                          h-1
                          bg-gradient-to-l
                          from-[var(--primary)]
                          to-[var(--primary)]/20
                        "
                      />

                      <div
                        className="
                          grid
                          grid-cols-[210px_1fr]
                        "
                      >
                        <div
                          className="
                            border-l
                            border-[var(--border)]
                            bg-[var(--surface-2)]
                            p-5
                          "
                        >
                          <div
                            className="
                              grid size-12
                              place-items-center
                              rounded-2xl
                              bg-[var(--primary)]/10
                              text-[var(--primary)]
                            "
                          >
                            <Grid2X2 size={21} />
                          </div>

                          <h3
                            className="
                              mt-4
                              text-sm font-black
                              text-[var(--text)]
                            "
                          >
                            دسته‌بندی ابزارها
                          </h3>

                          <p
                            className="
                              mt-2
                              text-[10px]
                              font-medium
                              leading-6
                              text-[var(--muted)]
                            "
                          >
                            ابزار مورد نیازت را سریع از بین دسته‌بندی‌ها پیدا
                            کن.
                          </p>

                          <Link
                            href="/products"
                            onClick={closeAll}
                            className="
                              mt-5
                              flex
                              items-center
                              justify-between
                              rounded-xl
                              bg-[var(--primary)]
                              px-3 py-3
                              text-[9px]
                              font-black
                              text-white
                            "
                          >
                            مشاهده همه محصولات
                            <ArrowLeft size={14} />
                          </Link>
                        </div>

                        <div
                          className="
                            max-h-[420px]
                            overflow-y-auto
                            p-5
                          "
                        >
                          {categories.length > 0 ? (
                            <div
                              className="
                                grid
                                grid-cols-2
                                gap-2
                              "
                            >
                              {categories.map((category) => (
                                <Link
                                  key={category.id}
                                  href={`/products?category=${encodeURIComponent(
                                    category.name,
                                  )}`}
                                  onClick={closeAll}
                                  className="
                                    group
                                    flex
                                    items-center
                                    gap-3
                                    rounded-2xl
                                    border
                                    border-transparent
                                    p-3
                                    transition
                                    hover:border-[var(--border)]
                                    hover:bg-[var(--surface-2)]
                                  "
                                >
                                  <span
                                    className="
                                      grid size-10
                                      shrink-0
                                      place-items-center
                                      rounded-xl
                                      bg-[var(--surface-2)]
                                      text-[var(--muted)]
                                      transition
                                      group-hover:bg-[var(--primary)]/10
                                      group-hover:text-[var(--primary)]
                                    "
                                  >
                                    <Package size={16} />
                                  </span>

                                  <span
                                    className="
                                      min-w-0
                                      flex-1
                                      truncate
                                      text-[10px]
                                      font-black
                                      text-[var(--text)]
                                    "
                                  >
                                    {category.name}
                                  </span>

                                  <ChevronLeft
                                    size={13}
                                    className="
                                      text-[var(--muted)]
                                      opacity-0
                                      transition
                                      group-hover:opacity-100
                                    "
                                  />
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div
                              className="
                                flex h-48
                                items-center
                                justify-center
                                text-xs font-bold
                                text-[var(--muted)]
                              "
                            >
                              دسته‌بندی‌ای موجود نیست.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <nav
                className="
                  mr-3
                  flex items-center
                  gap-0.5
                "
              >
                <Link
                  href="/products"
                  className="
                    flex h-10
                    items-center
                    gap-2
                    rounded-xl
                    px-4
                    text-[10px]
                    font-bold
                    text-[var(--muted)]
                    transition
                    hover:bg-[var(--surface-2)]
                    hover:text-[var(--text)]
                  "
                >
                  فروشگاه
                </Link>

                <Link
                  href="/products?sort=newest"
                  className="
                    flex h-10
                    items-center
                    gap-2
                    rounded-xl
                    px-4
                    text-[10px]
                    font-bold
                    text-[var(--muted)]
                    transition
                    hover:bg-[var(--surface-2)]
                    hover:text-[var(--text)]
                  "
                >
                  <Sparkles size={14} className="text-[var(--primary)]" />
                  جدیدترین‌ها
                </Link>

                <Link
                  href="/products?sort=popular"
                  className="
                    flex h-10
                    items-center
                    gap-2
                    rounded-xl
                    px-4
                    text-[10px]
                    font-bold
                    text-[var(--muted)]
                    transition
                    hover:bg-[var(--surface-2)]
                    hover:text-[var(--text)]
                  "
                >
                  <Flame size={14} className="text-orange-500" />
                  پرفروش‌ها
                </Link>

                <Link
                  href="/products?discount=true"
                  className="
                    flex h-10
                    items-center
                    gap-2
                    rounded-xl
                    px-4
                    text-[10px]
                    font-bold
                    text-[var(--muted)]
                    transition
                    hover:bg-[var(--surface-2)]
                    hover:text-[var(--text)]
                  "
                >
                  <Percent size={14} className="text-red-500" />
                  پیشنهادهای ویژه
                </Link>
              </nav>

              <div
                className="
                  mr-auto
                  flex
                  items-center
                  gap-5
                "
              >
                <div
                  className="
                    flex items-center
                    gap-1.5
                    text-[8px]
                    font-bold
                    text-[var(--muted)]
                  "
                >
                  <ShieldCheck size={14} className="text-[var(--primary)]" />
                  ضمانت اصالت
                </div>

                <div
                  className="
                    flex items-center
                    gap-1.5
                    text-[8px]
                    font-bold
                    text-[var(--muted)]
                  "
                >
                  <Truck size={14} className="text-[var(--primary)]" />
                  ارسال سریع
                </div>

                <div
                  className="
                    flex items-center
                    gap-1.5
                    text-[8px]
                    font-bold
                    text-[var(--muted)]
                  "
                >
                  <Headphones size={14} className="text-[var(--primary)]" />
                  پشتیبانی
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================================
           MOBILE HEADER
        ================================================================== */}

        <div className="lg:hidden">
          {/* TOP */}

          <div
            className="
              flex h-[72px]
              items-center
              px-3
              sm:px-4
            "
          >
            <Link
              href="/"
              onClick={closeAll}
              className="
                flex min-w-0
                flex-1
                items-center
                gap-2.5
                transition
                active:scale-[0.98]
              "
            >
              <div
                className="
                  relative
                  h-[46px]
                  w-[58px]
                  shrink-0
                "
              >
                <Image
                  src={logoSrc}
                  alt="لوگوی ابزار احمدی"
                  fill
                  priority
                  sizes="58px"
                  className="object-contain object-center"
                />
              </div>

              <div
                className="
                  flex min-w-0
                  flex-col
                  justify-center
                  text-right
                "
              >
                <div
                  className="
                    whitespace-nowrap
                    text-[16px]
                    font-black
                    leading-6
                    tracking-[-0.5px]
                  "
                >
                  <span className="text-[var(--primary)]">ابزار</span>{" "}
                  <span className="text-[var(--text)]">احمدی</span>
                </div>

                <span
                  className="
                    mt-0.5
                    whitespace-nowrap
                    text-[7px]
                    font-bold
                    leading-4
                    text-[var(--muted)]
                  "
                >
                  فروشگاه ابزار آلات ساختمانی
                </span>
              </div>
            </Link>

            <div
              className="
                flex shrink-0
                items-center gap-2
              "
            >
              <ThemeToggle />

              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="
                  grid size-11
                  shrink-0
                  place-items-center
                  rounded-2xl
                  border
                  border-[var(--border)]
                  bg-[var(--surface-2)]
                  text-[var(--text)]
                  transition
                  hover:border-[var(--primary)]/30
                  hover:bg-[var(--primary)]/5
                  hover:text-[var(--primary)]
                  active:scale-95
                "
                aria-label="باز کردن منو"
                aria-expanded={mobileMenuOpen}
              >
                <Menu size={20} strokeWidth={2.2} />
              </button>
            </div>
          </div>

          {/* SEARCH BAR */}

          <div
            className="
              px-3 pb-3
              sm:px-4
            "
          >
            <button
              type="button"
              onClick={openMobileSearch}
              className="
                group
                flex h-[50px]
                w-full
                items-center gap-3
                rounded-2xl
                border
                border-[var(--border)]
                bg-[var(--surface-2)]
                px-3
                text-right
                transition
                hover:border-[var(--primary)]/30
                active:scale-[0.99]
              "
            >
              <span
                className="
                  grid size-9
                  shrink-0
                  place-items-center
                  rounded-xl
                  bg-[var(--surface)]
                  text-[var(--muted)]
                  transition
                  group-hover:bg-[var(--primary)]/10
                  group-hover:text-[var(--primary)]
                "
              >
                <Search size={17} />
              </span>

              <span
                className="
                  flex-1
                  truncate
                  text-xs
                  font-medium
                  text-[var(--muted)]
                "
              >
                جستجوی ابزار، برند یا کد کالا...
              </span>

              <span
                className="
                  rounded-lg
                  bg-[var(--surface)]
                  px-2
                  py-1
                  text-[8px]
                  font-black
                  text-[var(--muted)]
                "
              >
                جستجو
              </span>
            </button>
          </div>
        </div>
      </header>

      {mobileSearch}

      {mobileMenu}
    </>
  );
}
