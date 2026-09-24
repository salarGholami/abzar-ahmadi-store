"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  Grid2X2,
  Headphones,
  Menu,
  Package,
  Search,
  ShieldCheck,
  Sparkles,
  Flame,
  Truck,
  UserRound,
  X,
  Percent,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

import ThemeToggle from "../ui/ThemeToggle";
import { useCart } from "@/lib/cart-context";
import type { Category } from "@/lib/types";

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

  /* -------------------------------------------------------------------------- */
  /* THEME                                                                      */
  /* -------------------------------------------------------------------------- */

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

  /* -------------------------------------------------------------------------- */
  /* SCROLL                                                                     */
  /* -------------------------------------------------------------------------- */

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

  /* -------------------------------------------------------------------------- */
  /* DATA                                                                       */
  /* -------------------------------------------------------------------------- */

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

  /* -------------------------------------------------------------------------- */
  /* BODY LOCK                                                                  */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!mobileMenuOpen && !mobileSearchOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen, mobileSearchOpen]);

  /* -------------------------------------------------------------------------- */
  /* ESC                                                                        */
  /* -------------------------------------------------------------------------- */

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

  /* -------------------------------------------------------------------------- */
  /* SEARCH                                                                     */
  /* -------------------------------------------------------------------------- */

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

  /* -------------------------------------------------------------------------- */
  /* CLOSE ALL                                                                  */
  /* -------------------------------------------------------------------------- */

  const closeAll = () => {
    setDesktopCategoriesOpen(false);
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  };

  /* -------------------------------------------------------------------------- */
  /* LOGO                                                                       */
  /* -------------------------------------------------------------------------- */

  const logoSrc = isDark
    ? "/images/logo/abzar-ahmadi-logo-dark.png"
    : "/images/logo/abzar-ahmadi-logo-light.png";

  /* ========================================================================== */
  /* MOBILE MENU                                                                */
  /* ========================================================================== */

  const mobileMenu =
    mobileMenuOpen &&
    typeof document !== "undefined" &&
    createPortal(
      <div dir="rtl" className="fixed inset-0 z-[100] lg:hidden">
        {/* BACKDROP */}

        <button
          type="button"
          aria-label="بستن منو"
          onClick={() => setMobileMenuOpen(false)}
          className="
            absolute inset-0
            h-full w-full
            cursor-default
            bg-black/60
            backdrop-blur-md
          "
        />

        {/* PANEL */}

        <div
          className="
            absolute inset-y-0 right-0
            flex w-[91%] max-w-[430px]
            flex-col
            overflow-hidden
            border-l
            border-[var(--border)]
            bg-[var(--surface)]
            shadow-[-20px_0_70px_rgba(0,0,0,0.18)]
          "
        >
          {/* ACCENT */}

          <div
            className="
              h-[3px] shrink-0
              bg-gradient-to-l
              from-[var(--primary)]
              via-[var(--primary)]
              to-transparent
            "
          />

          {/* MENU HEADER */}

          <div
            className="
              flex items-center
              justify-between
              border-b
              border-[var(--border)]
              px-5 py-4
            "
          >
            {/* BRAND */}

            <Link
              href="/"
              onClick={closeAll}
              className="
                flex min-w-0
                items-center
                gap-2.5
                transition
                active:scale-[0.98]
              "
            >
              <div
                className="
                  relative
                  h-[44px]
                  w-[56px]
                  shrink-0
                "
              >
                <Image
                  src={logoSrc}
                  alt="لوگوی ابزار احمدی"
                  fill
                  priority
                  sizes="56px"
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
                    tracking-[-0.4px]
                  "
                >
                  <span className="text-[var(--primary)]">ابزار</span>{" "}
                  <span className="text-[var(--text)]">احمدی</span>
                </div>

                <span
                  className="
                    mt-0.5
                    whitespace-nowrap
                    text-[8px]
                    font-bold
                    leading-4
                    text-[var(--muted)]
                  "
                >
                  فروشگاه ابزار آلات ساختمانی
                </span>
              </div>
            </Link>

            {/* CLOSE */}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="
                grid size-10
                shrink-0
                place-items-center
                rounded-xl
                border
                border-[var(--border)]
                bg-[var(--surface-2)]
                text-[var(--muted)]
                transition
                hover:border-[var(--primary)]/30
                hover:text-[var(--primary)]
                active:scale-95
              "
              aria-label="بستن"
            >
              <X size={19} />
            </button>
          </div>

          {/* MENU CONTENT */}

          <div
            className="
              flex-1
              overflow-y-auto
              overscroll-contain
              px-4 pb-7 pt-4
            "
          >
            {/* SEARCH */}

            <form
              onSubmit={submitSearch}
              className="
                flex h-[52px]
                items-center gap-3
                rounded-2xl
                border
                border-[var(--border)]
                bg-[var(--surface-2)]
                px-3
                transition
                focus-within:border-[var(--primary)]/50
                focus-within:ring-4
                focus-within:ring-[var(--primary)]/10
              "
            >
              <span
                className="
                  grid size-9
                  shrink-0
                  place-items-center
                  rounded-xl
                  bg-[var(--primary)]/10
                  text-[var(--primary)]
                "
              >
                <Search size={17} />
              </span>

              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                type="search"
                placeholder="چی می‌خوای پیدا کنی؟"
                className="
                  min-w-0 flex-1
                  bg-transparent
                  text-xs font-bold
                  text-[var(--text)]
                  outline-none
                  placeholder:text-[var(--muted)]
                "
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

            {/* QUICK ACTIONS */}

            <div className="mt-5">
              <div
                className="
                  mb-3 flex
                  items-center
                  justify-between
                "
              >
                <span
                  className="
                    text-[10px]
                    font-black
                    text-[var(--muted)]
                  "
                >
                  دسترسی سریع
                </span>

                <span
                  className="
                    h-px w-16
                    bg-[var(--border)]
                  "
                />
              </div>

              <div
                className="
                  grid grid-cols-2
                  gap-2
                "
              >
                {/* STORE */}

                <Link
                  href="/products"
                  onClick={closeAll}
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-2xl
                    bg-[var(--primary)]
                    p-4
                    text-white
                    shadow-lg
                    shadow-[var(--primary)]/15
                    transition
                    active:scale-[0.98]
                  "
                >
                  <div
                    className="
                      absolute
                      -left-6 -top-6
                      size-20
                      rounded-full
                      bg-white/10
                    "
                  />

                  <div
                    className="
                      relative
                      grid size-10
                      place-items-center
                      rounded-xl
                      bg-white/15
                    "
                  >
                    <ShoppingBag size={18} />
                  </div>

                  <div className="relative mt-3">
                    <div className="text-xs font-black">فروشگاه</div>

                    <div className="mt-1 text-[9px] text-white/65">
                      همه محصولات
                    </div>
                  </div>
                </Link>

                {/* NEW */}

                <Link
                  href="/products?sort=newest"
                  onClick={closeAll}
                  className="
                    group
                    rounded-2xl
                    border
                    border-[var(--border)]
                    bg-[var(--surface-2)]
                    p-4
                    transition
                    hover:border-[var(--primary)]/20
                    active:scale-[0.98]
                  "
                >
                  <div
                    className="
                      grid size-10
                      place-items-center
                      rounded-xl
                      bg-[var(--primary)]/10
                      text-[var(--primary)]
                    "
                  >
                    <Sparkles size={18} />
                  </div>

                  <div
                    className="
                      mt-3 text-xs
                      font-black
                      text-[var(--text)]
                    "
                  >
                    جدیدترین‌ها
                  </div>

                  <div
                    className="
                      mt-1 text-[9px]
                      text-[var(--muted)]
                    "
                  >
                    تازه‌ترین محصولات
                  </div>
                </Link>
              </div>
            </div>

            {/* MAIN NAV */}

            <div className="mt-6">
              <div
                className="
                  mb-3 flex
                  items-center
                  justify-between
                "
              >
                <span
                  className="
                    text-[10px]
                    font-black
                    text-[var(--muted)]
                  "
                >
                  منوی فروشگاه
                </span>

                <span
                  className="
                    h-px w-16
                    bg-[var(--border)]
                  "
                />
              </div>

              <div
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-[var(--border)]
                  bg-[var(--surface-2)]
                "
              >
                {/* STORE */}

                <Link
                  href="/products"
                  onClick={closeAll}
                  className="
                    group
                    flex items-center
                    gap-3
                    border-b
                    border-[var(--border)]
                    px-4 py-3.5
                    transition
                    hover:bg-[var(--surface)]
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
                    <Grid2X2 size={16} />
                  </span>

                  <span
                    className="
                      flex-1 text-xs
                      font-bold
                      text-[var(--text)]
                    "
                  >
                    فروشگاه
                  </span>

                  <ChevronLeft size={15} className="text-[var(--muted)]" />
                </Link>

                {/* POPULAR */}

                <Link
                  href="/products?sort=popular"
                  onClick={closeAll}
                  className="
                    group
                    flex items-center
                    gap-3
                    border-b
                    border-[var(--border)]
                    px-4 py-3.5
                    transition
                    hover:bg-[var(--surface)]
                  "
                >
                  <span
                    className="
                      grid size-9
                      place-items-center
                      rounded-xl
                      bg-orange-500/10
                      text-orange-500
                    "
                  >
                    <Flame size={16} />
                  </span>

                  <span
                    className="
                      flex-1 text-xs
                      font-bold
                      text-[var(--text)]
                    "
                  >
                    پرفروش‌ها
                  </span>

                  <ChevronLeft size={15} className="text-[var(--muted)]" />
                </Link>

                {/* DISCOUNT */}

                <Link
                  href="/products?discount=true"
                  onClick={closeAll}
                  className="
                    group
                    flex items-center
                    gap-3
                    border-b
                    border-[var(--border)]
                    px-4 py-3.5
                    transition
                    hover:bg-[var(--surface)]
                  "
                >
                  <span
                    className="
                      grid size-9
                      place-items-center
                      rounded-xl
                      bg-red-500/10
                      text-red-500
                    "
                  >
                    <Percent size={16} />
                  </span>

                  <span
                    className="
                      flex-1 text-xs
                      font-bold
                      text-[var(--text)]
                    "
                  >
                    پیشنهادهای ویژه
                  </span>

                  <ChevronLeft size={15} className="text-[var(--muted)]" />
                </Link>

                {/* NEW */}

                <Link
                  href="/products?sort=newest"
                  onClick={closeAll}
                  className="
                    group
                    flex items-center
                    gap-3
                    px-4 py-3.5
                    transition
                    hover:bg-[var(--surface)]
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
                    <Sparkles size={16} />
                  </span>

                  <span
                    className="
                      flex-1 text-xs
                      font-bold
                      text-[var(--text)]
                    "
                  >
                    جدیدترین‌ها
                  </span>

                  <ChevronLeft size={15} className="text-[var(--muted)]" />
                </Link>
              </div>
            </div>

            {/* ACCOUNT */}

            <div className="mt-6">
              <Link
                href="/account"
                onClick={closeAll}
                className="
                  group
                  flex items-center
                  gap-3
                  rounded-2xl
                  border
                  border-[var(--border)]
                  bg-[var(--surface-2)]
                  p-4
                  transition
                  hover:border-[var(--primary)]/25
                "
              >
                <div
                  className="
                    grid size-11
                    place-items-center
                    rounded-xl
                    bg-[var(--primary)]/10
                    text-[var(--primary)]
                  "
                >
                  <UserRound size={19} />
                </div>

                <div className="min-w-0 flex-1">
                  <div
                    className="
                      truncate
                      text-xs font-black
                      text-[var(--text)]
                    "
                  >
                    {userName ?? "حساب کاربری"}
                  </div>

                  <div
                    className="
                      mt-1 text-[9px]
                      text-[var(--muted)]
                    "
                  >
                    {userName ? "مشاهده حساب و سفارش‌ها" : "ورود یا ثبت‌نام"}
                  </div>
                </div>

                <ChevronLeft size={16} className="text-[var(--muted)]" />
              </Link>
            </div>

            {/* CATEGORIES */}

            <div className="mt-6">
              <div
                className="
                  mb-3 flex
                  items-center
                  justify-between
                "
              >
                <div
                  className="
                    flex items-center gap-2
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
                    <Grid2X2 size={14} />
                  </span>

                  <span
                    className="
                      text-xs font-black
                      text-[var(--text)]
                    "
                  >
                    دسته‌بندی کالاها
                  </span>
                </div>

                <span
                  className="
                    rounded-full
                    bg-[var(--surface-2)]
                    px-2.5 py-1
                    text-[8px] font-black
                    text-[var(--muted)]
                  "
                >
                  {categories.length.toLocaleString("fa-IR")} دسته
                </span>
              </div>

              <div className="space-y-1">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/products?category=${encodeURIComponent(
                        category.name,
                      )}`}
                      onClick={closeAll}
                      className="
                        group
                        flex items-center
                        gap-3
                        rounded-2xl
                        p-2.5
                        transition
                        hover:bg-[var(--surface-2)]
                        active:scale-[0.99]
                      "
                    >
                      <span
                        className="
                          grid size-10
                          shrink-0
                          place-items-center
                          rounded-xl
                          border
                          border-[var(--border)]
                          bg-[var(--surface-2)]
                          text-[var(--muted)]
                          transition
                          group-hover:border-[var(--primary)]/20
                          group-hover:bg-[var(--primary)]/10
                          group-hover:text-[var(--primary)]
                        "
                      >
                        <Package size={16} />
                      </span>

                      <span
                        className="
                          flex-1
                          truncate
                          text-xs font-bold
                          text-[var(--text)]
                        "
                      >
                        {category.name}
                      </span>

                      <ChevronLeft size={15} className="text-[var(--muted)]" />
                    </Link>
                  ))
                ) : (
                  <div
                    className="
                      rounded-2xl
                      border border-dashed
                      border-[var(--border)]
                      py-8
                      text-center
                      text-xs font-bold
                      text-[var(--muted)]
                    "
                  >
                    دسته‌بندی‌ای موجود نیست.
                  </div>
                )}
              </div>
            </div>

            {/* SERVICES */}

            <div
              className="
                mt-6
                grid grid-cols-3
                gap-2
              "
            >
              <div
                className="
                  rounded-2xl
                  border border-[var(--border)]
                  bg-[var(--surface-2)]
                  p-3 text-center
                "
              >
                <ShieldCheck
                  size={17}
                  className="mx-auto text-[var(--primary)]"
                />

                <div
                  className="
                    mt-2 text-[8px]
                    font-bold
                    text-[var(--muted)]
                  "
                >
                  ضمانت اصالت
                </div>
              </div>

              <div
                className="
                  rounded-2xl
                  border border-[var(--border)]
                  bg-[var(--surface-2)]
                  p-3 text-center
                "
              >
                <Truck size={17} className="mx-auto text-[var(--primary)]" />

                <div
                  className="
                    mt-2 text-[8px]
                    font-bold
                    text-[var(--muted)]
                  "
                >
                  ارسال سریع
                </div>
              </div>

              <div
                className="
                  rounded-2xl
                  border border-[var(--border)]
                  bg-[var(--surface-2)]
                  p-3 text-center
                "
              >
                <Headphones
                  size={17}
                  className="mx-auto text-[var(--primary)]"
                />

                <div
                  className="
                    mt-2 text-[8px]
                    font-bold
                    text-[var(--muted)]
                  "
                >
                  پشتیبانی
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body,
    );

  /* ========================================================================== */
  /* MOBILE SEARCH                                                              */
  /* ========================================================================== */

  const mobileSearch =
    mobileSearchOpen &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        dir="rtl"
        className="
          fixed inset-0 z-[110]
          bg-[var(--surface)]
          lg:hidden
        "
      >
        <div className="flex h-full flex-col">
          {/* SEARCH HEADER */}

          <div
            className="
              flex h-[72px]
              items-center gap-2
              border-b
              border-[var(--border)]
              px-3
            "
          >
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
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
              <Search
                size={18}
                className="
                  shrink-0
                  text-[var(--primary)]
                "
              />

              <input
                ref={mobileSearchRef}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                type="search"
                placeholder="جستجوی محصول..."
                className="
                  min-w-0 flex-1
                  bg-transparent
                  text-sm font-bold
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

          <div
            className="
              flex-1
              overflow-y-auto
              p-5
            "
          >
            <div
              className="
                mb-5
                flex items-center gap-2
                text-xs font-black
                text-[var(--text)]
              "
            >
              <Search size={15} className="text-[var(--primary)]" />
              جستجوی سریع
            </div>

            <div
              className="
                grid grid-cols-2
                gap-2
              "
            >
              <Link
                href="/products?sort=newest"
                onClick={closeAll}
                className="
                  rounded-2xl
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
                    mt-3 text-xs font-black
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
                  rounded-2xl
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
                    mt-3 text-xs font-black
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
                  mb-3 text-xs font-black
                  text-[var(--text)]
                "
              >
                دسته‌بندی‌ها
              </div>

              <div className="space-y-1">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${encodeURIComponent(
                      category.name,
                    )}`}
                    onClick={closeAll}
                    className="
                      flex items-center
                      gap-3
                      rounded-2xl
                      p-3
                      transition
                      hover:bg-[var(--surface-2)]
                    "
                  >
                    <span
                      className="
                        grid size-9
                        place-items-center
                        rounded-xl
                        bg-[var(--surface-2)]
                        text-[var(--muted)]
                      "
                    >
                      <Package size={15} />
                    </span>

                    <span
                      className="
                        flex-1 truncate
                        text-xs font-bold
                        text-[var(--text)]
                      "
                    >
                      {category.name}
                    </span>

                    <ChevronLeft size={14} className="text-[var(--muted)]" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body,
    );

  /* ========================================================================== */
  /* HEADER                                                                     */
  /* ========================================================================== */

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

        {/* ================================================================== */}
        {/* DESKTOP                                                             */}
        {/* ================================================================== */}

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
              {/* LOGO */}

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

              {/* BRAND TEXT */}

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
              {/* DARK / LIGHT */}

              <ThemeToggle />

              {/* ACCOUNT */}

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

              {/* CART */}

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

          <div
            className="
              border-t
              border-[var(--border)]
            "
          >
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
              {/* CATEGORIES */}

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

              {/* NAVIGATION */}

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

              {/* SERVICES */}

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

        {/* ================================================================== */}
        {/* MOBILE                                                              */}
        {/* ================================================================== */}

        <div className="lg:hidden">
          {/* MOBILE TOP */}

          <div
            className="
              flex h-[74px]
              items-center
              px-3
              sm:px-4
            "
          >
            {/* BRAND - RIGHT */}

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
              {/* LOGO */}

              <div
                className="
                  relative
                  h-[48px]
                  w-[60px]
                  shrink-0
                "
              >
                <Image
                  src={logoSrc}
                  alt="لوگوی ابزار احمدی"
                  fill
                  priority
                  sizes="60px"
                  className="object-contain object-center"
                />
              </div>

              {/* BRAND TEXT */}

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
                    text-[17px]
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
                    text-[8px]
                    font-bold
                    leading-4
                    text-[var(--muted)]
                  "
                >
                  فروشگاه ابزار آلات ساختمانی
                </span>
              </div>
            </Link>

            {/* MOBILE ACTIONS - LEFT */}

            <div
              className="
                flex
                shrink-0
                items-center
                gap-2
              "
            >
              {/* DARK / LIGHT */}

              <div
                className="
                  flex
                  shrink-0
                  items-center
                "
              >
                <ThemeToggle />
              </div>

              {/* HAMBURGER */}

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
                  transition-all
                  duration-200
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

          {/* MOBILE SEARCH */}

          <div
            className="
              px-3 pb-3
              sm:px-4
            "
          >
            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen(true);

                window.setTimeout(() => {
                  mobileSearchRef.current?.focus();
                }, 100);
              }}
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
