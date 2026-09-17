"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, ShoppingCart, Package, Users, Truck, Boxes, ReceiptText,
  WalletCards, ClipboardCheck, BarChart3, Settings, LogOut, Store, X,
  Tags, ChevronLeft, Database, UserCog, Receipt, ArrowDownCircle, ArrowUpCircle, ScrollText, type LucideIcon,
} from "lucide-react";
import type { Session } from "@/lib/auth";

type NavItem = { label: string; href: string; icon: LucideIcon };
type NavGroup = { label: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    label: "فروش و عملیات",
    items: [
      { label: "نمای کلی", href: "/dashboard", icon: LayoutDashboard },
      { label: "فروش جدید", href: "/dashboard/pos", icon: ShoppingCart },
      { label: "فروش‌ها و فاکتورها", href: "/dashboard/sales", icon: ReceiptText },
      { label: "خرید از تأمین‌کننده", href: "/dashboard/purchases", icon: Truck },
    ],
  },
  {
    label: "کاتالوگ و موجودی",
    items: [
      { label: "محصولات", href: "/dashboard/products", icon: Package },
      { label: "دسته‌بندی‌ها", href: "/dashboard/categories", icon: Tags },
      { label: "انبار", href: "/dashboard/inventory", icon: Boxes },
      { label: "تأمین‌کنندگان", href: "/dashboard/suppliers", icon: Truck },
      { label: "مشتریان", href: "/dashboard/customers", icon: Users },
    ],
  },
  {
    label: "مالی و کنترل",
    items: [
      { label: "مالی", href: "/dashboard/finance", icon: WalletCards },
      { label: "چک‌ها", href: "/dashboard/checks", icon: ClipboardCheck },
      { label: "گزارش‌ها", href: "/dashboard/reports", icon: BarChart3 },
      { label: "درآمدهای متفرقه", href: "/dashboard/incomes", icon: ArrowUpCircle },
      { label: "هزینه‌ها", href: "/dashboard/expenses", icon: ArrowDownCircle },
      { label: "پیش‌فاکتورها", href: "/dashboard/quotations", icon: Receipt },
      { label: "برندها", href: "/dashboard/brands", icon: Tags },
      { label: "لاگ فعالیت‌ها", href: "/dashboard/activity", icon: ScrollText },
      { label: "کاربران مدیر", href: "/dashboard/users", icon: UserCog },
      { label: "مرکز داده‌ها", href: "/dashboard/data", icon: Database },
      { label: "تنظیمات", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

export default function Sidebar({
  open = false,
  collapsed = false,
  onClose,
  user,
}: {
  open?: boolean;
  collapsed?: boolean;
  onClose?: () => void;
  user: Pick<Session, "id" | "name" | "role" | "permissions">;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/account");
    router.refresh();
  }

  return (
    <aside
      className={`fixed right-0 top-0 z-50 flex h-dvh flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-2xl shadow-black/10 transition-[width,transform] duration-200 lg:shadow-none ${
        open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      } ${collapsed ? "w-[88px]" : "w-[292px]"}`}
    >
      <div className="flex h-[72px] shrink-0 items-center border-b border-[var(--border)] px-4">
        <Link href="/dashboard" onClick={onClose} className="flex min-w-0 items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--primary)] text-lg font-black text-white shadow-lg shadow-[var(--primary)]/20">آ</div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-black">ابزارینو</div>
              <div className="mt-0.5 truncate text-[10px] font-medium text-[var(--muted)]">مدیریت یکپارچه فروشگاه</div>
            </div>
          )}
        </Link>
        <button className="btn btn-secondary mr-auto !size-10 !p-0 lg:hidden" type="button" onClick={onClose} aria-label="بستن منو">
          <X size={18} />
        </button>
      </div>

      {!collapsed && (
        <div className="mx-3 mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
          <div className="text-[10px] font-bold text-[var(--muted)]">حساب فعال</div>
          <div className="mt-1.5 truncate text-sm font-black">{user.name}</div>
          <div className="mt-2 inline-flex rounded-full bg-[var(--primary)]/10 px-2 py-1 text-[10px] font-bold text-[var(--primary)]">مدیر سیستم</div>
        </div>
      )}

      <nav className="mt-4 flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {groups.map((group) => (
          <div key={group.label}>
            {!collapsed && <div className="px-3 text-[10px] font-black text-[var(--muted)]">{group.label}</div>}
            <div className="mt-2 space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    title={collapsed ? item.label : undefined}
                    className={`group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition ${
                      active
                        ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20"
                        : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                    } ${collapsed ? "justify-center" : ""}`}
                  >
                    <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                    {!collapsed && <span>{item.label}</span>}
                    {!collapsed && active && <ChevronLeft className="mr-auto" size={15} />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 space-y-2 border-t border-[var(--border)] p-3">
        <Link href="/" onClick={onClose} className={`flex items-center gap-2 rounded-2xl bg-[var(--surface-2)] px-3 py-3 text-sm font-bold ${collapsed ? "justify-center" : ""}`} title={collapsed ? "مشاهده فروشگاه" : undefined}>
          <Store size={17} />
          {!collapsed && <>مشاهده فروشگاه <span className="mr-auto">↗</span></>}
        </Link>
        <button type="button" onClick={logout} disabled={loggingOut} className={`flex w-full items-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 ${collapsed ? "justify-center" : ""}`} title={collapsed ? "خروج از حساب" : undefined}>
          <LogOut size={17} />
          {!collapsed && (loggingOut ? "در حال خروج..." : "خروج از حساب")}
        </button>
      </div>
    </aside>
  );
}
