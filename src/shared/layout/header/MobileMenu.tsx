"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  BadgePercent,
  BookOpen,
  ChevronLeft,
  ClipboardList,
  Headphones,
  Menu,
  Package,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import HeaderSearch from "./HeaderSearch";
import type { NavCategory } from "./types";

type Mode = "menu" | "search" | null;

const ACTIONS = [
  {
    href: "/products",
    title: "محصولات",
    description: "مشاهده تمام محصولات",
    icon: Package,
  },
  {
    href: "/order-tracking",
    title: "پیگیری سفارش",
    description: "بررسی وضعیت سفارش",
    icon: ClipboardList,
  },
  {
    href: "/account",
    title: "حساب کاربری",
    description: "سفارش‌ها و اطلاعات شما",
    icon: UserRound,
  },
  {
    href: "/brands",
    title: "برندها",
    description: "برندهای معتبر ابزار",
    icon: ShieldCheck,
  },
] as const;

const NAVIGATION = [
  {
    href: "/magazine",
    label: "مجله ابزار",
    icon: BookOpen,
  },
  {
    href: "/about",
    label: "درباره ابزار احمدی",
    icon: Wrench,
  },
  {
    href: "/contact",
    label: "تماس با ما",
    icon: Phone,
  },
] as const;

export default function MobileMenu({
  categories: _categories,
}: {
  categories: NavCategory[];
}) {
  const [mode, setMode] = useState<Mode>(null);

  const close = () => setMode(null);

  useEffect(() => {
    if (!mode) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMode(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mode]);

  return (
    <>
      {/* =========================================================
          MOBILE HEADER ACTIONS
      ========================================================= */}

      <div className="flex items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setMode("menu")}
          aria-label="باز کردن منو"
          aria-haspopup="dialog"
          className="
            group relative grid size-11 place-items-center
            overflow-hidden rounded-2xl
            border border-[var(--border)]
            bg-[var(--surface-2)]
            text-[var(--text)]
            shadow-sm
            transition-all duration-300
            hover:border-[var(--primary)]/40
            hover:text-[var(--primary)]
            active:scale-95
          "
        >
          <span
            className="
              absolute inset-0
              bg-[var(--primary)]/0
              transition-colors
              group-hover:bg-[var(--primary)]/5
            "
          />

          <Menu size={20} strokeWidth={2.2} className="relative z-10" />
        </button>

        <button
          type="button"
          onClick={() => setMode("search")}
          aria-label="جستجو"
          aria-haspopup="dialog"
          className="
            group relative grid size-11 place-items-center
            overflow-hidden rounded-2xl
            border border-[var(--border)]
            bg-[var(--surface-2)]
            text-[var(--text)]
            shadow-sm
            transition-all duration-300
            hover:border-[var(--primary)]/40
            hover:text-[var(--primary)]
            active:scale-95
          "
        >
          <span
            className="
              absolute inset-0
              bg-[var(--primary)]/0
              transition-colors
              group-hover:bg-[var(--primary)]/5
            "
          />

          <Search size={19} strokeWidth={2.2} className="relative z-10" />
        </button>
      </div>

      {/* =========================================================
          FULL SCREEN MODAL
      ========================================================= */}

      <AnimatePresence>
        {mode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="
              fixed inset-0 z-[9999]
              h-[100dvh] w-screen
              lg:hidden
            "
            role="dialog"
            aria-modal="true"
            aria-label={
              mode === "menu" ? "منوی ابزار احمدی" : "جستجو در ابزار احمدی"
            }
          >
            {/* Backdrop */}
            <button
              type="button"
              aria-label="بستن"
              onClick={close}
              className="
                absolute inset-0
                h-full w-full
                bg-black/60
                backdrop-blur-xl
              "
            />

            {/* Main panel */}
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.97,
                y: 24,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.98,
                y: 15,
              }}
              transition={{
                duration: 0.28,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
                relative
                flex h-[100dvh] w-full
                flex-col
                overflow-hidden
                bg-[var(--surface)]
              "
            >
              {/* =================================================
                  HEADER
              ================================================= */}

              <div
                className="
                  relative shrink-0
                  border-b border-[var(--border)]
                  bg-[var(--surface)]/90
                  backdrop-blur-2xl
                "
              >
                <div
                  className="
                    absolute inset-x-0 top-0 h-[3px]
                    bg-gradient-to-l
                    from-[var(--primary)]
                    via-[var(--primary)]/70
                    to-transparent
                  "
                />

                <div className="flex items-center justify-between px-5 pb-5 pt-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        grid size-11 place-items-center
                        rounded-2xl
                        bg-[var(--primary)]/10
                        text-[var(--primary)]
                      "
                    >
                      {mode === "menu" ? (
                        <Wrench size={21} />
                      ) : (
                        <Search size={20} />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-black text-[var(--text)]">
                        {mode === "menu" ? "ابزار احمدی" : "جستجو"}
                      </p>

                      <p className="mt-0.5 text-[10px] font-medium text-[var(--muted)]">
                        {mode === "menu"
                          ? "فروش حرفه‌ای ابزار"
                          : "محصول یا برند موردنظر را پیدا کنید"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={close}
                    aria-label="بستن"
                    className="
                      grid size-10 place-items-center
                      rounded-2xl
                      border border-[var(--border)]
                      bg-[var(--surface-2)]
                      text-[var(--muted)]
                      transition
                      hover:text-[var(--text)]
                      active:scale-95
                    "
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* =================================================
                  CONTENT
              ================================================= */}

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                {mode === "search" ? (
                  <SearchView onClose={close} />
                ) : (
                  <MenuView onClose={close} />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ===============================================================
   MENU VIEW
================================================================ */

function MenuView({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="px-5 pb-8 pt-5"
    >
      {/* =========================================================
          SEARCH CTA
      ========================================================= */}

      <button
        type="button"
        onClick={() => {
          // این دکمه به SearchView منتقل نمی‌شود،
          // چون mode در والد مدیریت می‌شود.
          // برای باز کردن جستجو از trigger اصلی هدر استفاده می‌شود.
        }}
        className="
          hidden
        "
      />

      <div
        className="
          relative overflow-hidden
          rounded-[28px]
          border border-[var(--border)]
          bg-[var(--surface-2)]
          p-5
        "
      >
        <div
          className="
            absolute -right-12 -top-12
            size-32
            rounded-full
            bg-[var(--primary)]/10
            blur-2xl
          "
        />

        <div
          className="
            absolute -bottom-16 -left-10
            size-32
            rounded-full
            bg-[var(--primary)]/5
            blur-2xl
          "
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[var(--primary)]" />

            <span className="text-[10px] font-black text-[var(--primary)]">
              SMART SHOPPING
            </span>
          </div>

          <h2 className="mt-3 text-xl font-black leading-8 text-[var(--text)]">
            هر ابزاری که نیاز داری،
            <br />
            همین‌جاست.
          </h2>

          <p className="mt-2 max-w-[280px] text-[11px] leading-5 text-[var(--muted)]">
            محصولات حرفه‌ای، برندهای معتبر و خریدی مطمئن برای کارهای تخصصی شما.
          </p>

          <Link
            href="/products"
            onClick={onClose}
            className="
              mt-5 inline-flex items-center gap-2
              rounded-2xl
              bg-[var(--primary)]
              px-4 py-3
              text-[11px] font-black
              text-white
              shadow-lg
              shadow-[var(--primary)]/20
              transition
              hover:-translate-y-0.5
              active:scale-95
            "
          >
            مشاهده محصولات
            <ArrowLeft size={14} />
          </Link>
        </div>
      </div>

      {/* =========================================================
          ACTION GRID
      ========================================================= */}

      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-[var(--text)]">دسترسی سریع</p>

            <p className="mt-1 text-[10px] font-medium text-[var(--muted)]">
              مهم‌ترین بخش‌های فروشگاه
            </p>
          </div>

          <span
            className="
              rounded-full
              bg-[var(--primary)]/10
              px-2.5 py-1
              text-[9px] font-black
              text-[var(--primary)]
            "
          >
            04
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {ACTIONS.map(({ href, title, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="
                  group relative overflow-hidden
                  rounded-[22px]
                  border border-[var(--border)]
                  bg-[var(--surface)]
                  p-4
                  transition-all duration-300
                  hover:-translate-y-0.5
                  hover:border-[var(--primary)]/35
                "
            >
              <div
                className="
                    absolute -bottom-7 -left-7
                    size-20
                    rounded-full
                    bg-[var(--primary)]/[0.04]
                    transition-transform duration-500
                    group-hover:scale-150
                  "
              />

              <div className="relative z-10">
                <div
                  className="
                      grid size-10 place-items-center
                      rounded-2xl
                      bg-[var(--primary)]/10
                      text-[var(--primary)]
                    "
                >
                  <Icon size={18} />
                </div>

                <p className="mt-3 text-xs font-black text-[var(--text)]">
                  {title}
                </p>

                <p className="mt-1 text-[9px] leading-4 text-[var(--muted)]">
                  {description}
                </p>
              </div>

              <ChevronLeft
                size={14}
                className="
                    absolute bottom-4 left-4
                    text-[var(--muted)]
                    transition
                    group-hover:-translate-x-0.5
                    group-hover:text-[var(--primary)]
                  "
              />
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================================
          SPECIAL OFFER
      ========================================================= */}

      <Link
        href="/products"
        onClick={onClose}
        className="
          group relative mt-7 block overflow-hidden
          rounded-[24px]
          border border-[var(--primary)]/15
          bg-[var(--primary)]/[0.06]
          p-4
          transition
          hover:border-[var(--primary)]/30
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              grid size-11 shrink-0 place-items-center
              rounded-2xl
              bg-[var(--primary)]/10
              text-[var(--primary)]
            "
          >
            <BadgePercent size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-[var(--text)]">
              پیشنهادهای ویژه
            </p>

            <p className="mt-1 text-[10px] text-[var(--muted)]">
              تخفیف‌ها و محصولات منتخب را ببینید
            </p>
          </div>

          <ArrowLeft
            size={17}
            className="
              shrink-0
              text-[var(--primary)]
              transition
              group-hover:-translate-x-1
            "
          />
        </div>
      </Link>

      {/* =========================================================
          SECONDARY NAV
      ========================================================= */}

      <section className="mt-7">
        <p className="mb-3 text-sm font-black text-[var(--text)]">
          اطلاعات و خدمات
        </p>

        <div
          className="
            overflow-hidden
            rounded-[22px]
            border border-[var(--border)]
            bg-[var(--surface)]
          "
        >
          {NAVIGATION.map(({ href, label, icon: Icon }, index) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`
                  group
                  flex items-center gap-3
                  px-4 py-3.5
                  transition
                  hover:bg-[var(--surface-2)]
                  ${
                    index !== NAVIGATION.length - 1
                      ? "border-b border-[var(--border)]"
                      : ""
                  }
                `}
            >
              <div
                className="
                    grid size-9 place-items-center
                    rounded-xl
                    bg-[var(--surface-2)]
                    text-[var(--muted)]
                    transition
                    group-hover:text-[var(--primary)]
                  "
              >
                <Icon size={16} />
              </div>

              <span className="flex-1 text-xs font-bold text-[var(--text)]">
                {label}
              </span>

              <ChevronLeft
                size={15}
                className="
                    text-[var(--muted)]
                    transition
                    group-hover:-translate-x-0.5
                    group-hover:text-[var(--primary)]
                  "
              />
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================================
          SUPPORT
      ========================================================= */}

      <div
        className="
          mt-7
          flex items-center gap-3
          rounded-[22px]
          border border-[var(--border)]
          bg-[var(--surface-2)]
          p-4
        "
      >
        <div
          className="
            grid size-10 shrink-0 place-items-center
            rounded-2xl
            bg-[var(--primary)]/10
            text-[var(--primary)]
          "
        >
          <Headphones size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black text-[var(--text)]">
            نیاز به راهنمایی دارید؟
          </p>

          <p className="mt-1 text-[9px] leading-4 text-[var(--muted)]">
            کارشناسان ابزار احمدی آماده پاسخگویی هستند.
          </p>
        </div>

        <Link
          href="/contact"
          onClick={onClose}
          className="
            rounded-xl
            bg-[var(--surface)]
            px-3 py-2
            text-[9px] font-black
            text-[var(--primary)]
          "
        >
          تماس
        </Link>
      </div>
    </motion.div>
  );
}

/* ===============================================================
   SEARCH VIEW
================================================================ */

function SearchView({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="px-5 pb-8 pt-6"
    >
      <div
        className="
          rounded-[28px]
          border border-[var(--border)]
          bg-[var(--surface-2)]
          p-4
          shadow-sm
        "
      >
        <HeaderSearch inputId="mobile-search" autoFocus onSubmitted={onClose} />
      </div>

      <div className="mt-8">
        <div className="mb-3">
          <p className="text-sm font-black text-[var(--text)]">جستجوی سریع</p>

          <p className="mt-1 text-[10px] text-[var(--muted)]">
            عبارت‌های محبوب کاربران
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            "دریل",
            "فرز",
            "ابزار برقی",
            "ابزار دستی",
            "لوازم ایمنی",
            "جوشکاری",
          ].map((item) => (
            <button
              key={item}
              type="button"
              className="
                rounded-full
                border border-[var(--border)]
                bg-[var(--surface)]
                px-3.5 py-2.5
                text-[10px] font-bold
                text-[var(--text)]
                transition
                hover:border-[var(--primary)]/35
                hover:text-[var(--primary)]
                active:scale-95
              "
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div
        className="
          mt-7
          rounded-[24px]
          border border-[var(--primary)]/15
          bg-[var(--primary)]/[0.06]
          p-4
        "
      >
        <div className="flex items-start gap-3">
          <div
            className="
              grid size-10 shrink-0 place-items-center
              rounded-2xl
              bg-[var(--primary)]/10
              text-[var(--primary)]
            "
          >
            <Search size={17} />
          </div>

          <div>
            <p className="text-xs font-black text-[var(--text)]">
              محصول موردنظر را پیدا نکردید؟
            </p>

            <p className="mt-1 text-[10px] leading-5 text-[var(--muted)]">
              نام محصول یا برند را با جزئیات بیشتری جستجو کنید.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
