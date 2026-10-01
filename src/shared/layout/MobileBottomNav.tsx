"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  ShoppingCart,
  UserRound,
  Package,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";

const navItems = [
  {
    href: "/",
    label: "خانه",
    icon: Home,
    match: (path: string) => path === "/",
  },
  {
    href: "/products",
    label: "دسته‌بندی",
    icon: LayoutGrid,
    match: (path: string) =>
      path.startsWith("/products") && !path.includes("/cart"),
  },
  {
    href: "/cart",
    label: "سبد خرید",
    icon: ShoppingCart,
    match: (path: string) => path.startsWith("/cart"),
    badge: true,
  },
  {
    href: "/account",
    label: "حساب من",
    icon: UserRound,
    match: (path: string) => path.startsWith("/account"),
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { count } = useCart();

  // Hide on dashboard and auth-heavy flows if needed; keep simple for store
  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 md:hidden"
      aria-label="منوی پایین موبایل"
    >
      {/* Soft gradient fade above the bar */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-[var(--surface)] to-transparent"
        aria-hidden
      />

      <div
        className="
          border-t border-[var(--border)]
          bg-[var(--surface)]/95
          backdrop-blur-xl
          supports-[backdrop-filter]:bg-[var(--surface)]/80
          shadow-[0_-8px_30px_rgba(0,0,0,0.08)]
          dark:shadow-[0_-8px_30px_rgba(0,0,0,0.35)]
          safe-area-pb
        "
      >
        <div className="mx-auto flex h-[4.25rem] max-w-lg items-stretch justify-around px-1">
          {navItems.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative flex flex-1 flex-col items-center justify-center gap-1
                  transition-all duration-200 active:scale-95
                  ${active ? "text-[var(--primary)]" : "text-[var(--muted)]"}
                `}
              >
                <span
                  className={`
                    relative flex size-10 items-center justify-center rounded-2xl
                    transition-all duration-200
                    ${
                      active
                        ? "bg-[var(--primary)]/12 shadow-sm shadow-[var(--primary)]/20"
                        : "bg-transparent"
                    }
                  `}
                >
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.4 : 1.9}
                    className="transition-transform duration-200"
                  />

                  {item.badge && count > 0 && (
                    <span
                      className="
                        absolute -right-1 -top-1
                        flex h-[18px] min-w-[18px] items-center justify-center
                        rounded-full bg-[var(--danger)] px-1
                        text-[10px] font-black leading-none text-white
                        shadow-sm
                      "
                    >
                      {count > 99 ? "۹۹+" : count.toLocaleString("fa-IR")}
                    </span>
                  )}
                </span>

                <span
                  className={`
                    text-[10px] font-bold tracking-tight
                    ${active ? "text-[var(--primary)]" : "text-[var(--muted)]"}
                  `}
                >
                  {item.label}
                </span>

                {/* Active indicator line */}
                {active && (
                  <span
                    className="
                      absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2
                      rounded-full bg-[var(--primary)]
                    "
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
