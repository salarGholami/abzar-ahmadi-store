import ThemeToggle from "@/shared/ui/ThemeToggle";
import AccountLink from "./header/AccountLink";
import CartLink from "./header/CartLink";
import CategoryMenu from "./header/CategoryMenu";
import HeaderLogo from "./header/HeaderLogo";
import HeaderSearch from "./header/HeaderSearch";
import MobileMenu from "./header/MobileMenu";
import type { NavCategory } from "./header/types";

/**
 * Server Component shell. Only search, cart, account, theme and the menus
 * are client islands; everything else ships as plain HTML.
 */
export default function StoreHeader({ categories }: { categories: NavCategory[] }) {
  return (
    <header dir="rtl" className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-xl">
      <div className="h-[3px] bg-gradient-to-l from-[var(--primary)] via-[var(--primary)]/70 to-transparent" />

      <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-2.5 sm:px-6 lg:min-h-[88px] lg:gap-5 lg:px-8 xl:gap-7">
        <HeaderLogo />
        <HeaderSearch inputId="desktop-search" className="hidden flex-1 lg:flex" />
        <div className="ms-auto flex shrink-0 items-center gap-2 lg:ms-0">
          <MobileMenu categories={categories} />
          <ThemeToggle />
          <span className="hidden lg:block"><AccountLink /></span>
          <CartLink />
        </div>
      </div>

      <div className="hidden border-t border-[var(--border)] lg:block">
        <div className="mx-auto flex min-h-[52px] max-w-[1500px] items-center px-8">
          <CategoryMenu categories={categories} />
        </div>
      </div>
    </header>
  );
}
