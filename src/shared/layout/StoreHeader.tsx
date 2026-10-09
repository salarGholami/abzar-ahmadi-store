import ThemeToggle from "@/shared/ui/ThemeToggle";
import AccountLink from "./header/AccountLink";
import CartLink from "./header/CartLink";
import CategoryMenu from "./header/CategoryMenu";
import HeaderLogo from "./header/HeaderLogo";
import HeaderSearch from "./header/HeaderSearch";
import MobileMenu from "./header/MobileMenu";
import type { NavCategory } from "./header/types";
import Link from "next/link";

const primaryLinks = [
  { href: "/products", label: "فروشگاه" },
  { href: "/categories", label: "دسته‌بندی‌ها" },
  { href: "/brands", label: "برندها" },
  { href: "/magazine", label: "مجله" },
  { href: "/order-tracking", label: "پیگیری سفارش" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
] as const;

export default function StoreHeader({
  categories,
}: {
  categories: NavCategory[];
}) {
  return (
    <header
      dir="rtl"
      className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-xl"
    >
      <div className="h-[3px] bg-gradient-to-l from-[var(--primary)] via-[var(--primary)]/70 to-transparent" />

      <div className="relative mx-auto flex min-h-[72px] max-w-[1500px] items-center gap-3 px-4 py-2.5 sm:px-6 lg:min-h-[88px] lg:gap-5 lg:px-8 xl:gap-7">
        <div className="order-1 lg:order-none">
          <HeaderLogo />
        </div>
        <HeaderSearch
          inputId="desktop-search"
          className="hidden flex-1 lg:flex"
        />
        <div className="order-2 ms-auto flex shrink-0 items-center gap-1.5 lg:order-none lg:ms-0 lg:gap-2">
          <ThemeToggle />
          <span className="hidden lg:block">
            <AccountLink />
          </span>
          <span className="hidden lg:block">
            <CartLink />
          </span>
          <div className="lg:hidden">
            <MobileMenu categories={categories} />
          </div>
          <span className="lg:hidden" />
        </div>
      </div>

      <div className="hidden border-t border-[var(--border)] lg:block">
        <div className="mx-auto flex min-h-[52px] max-w-[1500px] items-center gap-2 px-8">
          <CategoryMenu categories={categories} />
          <span
            className="mx-1 h-6 w-px shrink-0 bg-[var(--border)]"
            aria-hidden
          />
          <nav
            aria-label="ناوبری اصلی"
            className="flex min-w-0 items-center gap-1 overflow-x-auto"
          >
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="shrink-0 rounded-xl px-3.5 py-2.5 text-[11px] font-black text-[var(--muted)] transition hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
