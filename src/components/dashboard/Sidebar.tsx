"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, ShoppingCart, Package, Users, Truck, Boxes, ReceiptText,
  WalletCards, ClipboardCheck, BarChart3, Settings, LogOut, Store, X, type LucideIcon
} from "lucide-react";
import type { Session } from "@/lib/auth";

type NavItem = { label: string; href: string; icon: LucideIcon; perm?: string };
type NavGroup = { label: string; items: NavItem[] };

const groups: NavGroup[] = [
  { label: "عملیات", items: [
    { label: "داشبورد", href: "/dashboard", icon: LayoutDashboard },
    { label: "صندوق فروش / POS", href: "/dashboard/pos", icon: ShoppingCart, perm: "sales.create" },
    { label: "فروش‌ها", href: "/dashboard/sales", icon: ReceiptText, perm: "sales.read" },
    { label: "خریدها", href: "/dashboard/purchases", icon: Truck, perm: "purchases.read" }
  ]},
  { label: "مدیریت", items: [
    { label: "محصولات", href: "/dashboard/products", icon: Package, perm: "products.read" },
    { label: "انبار", href: "/dashboard/inventory", icon: Boxes, perm: "inventory.read" },
    { label: "مشتریان", href: "/dashboard/customers", icon: Users, perm: "customers.read" },
    { label: "تأمین‌کنندگان", href: "/dashboard/suppliers", icon: Truck, perm: "suppliers.read" }
  ]},
  { label: "مالی و گزارش", items: [
    { label: "مالی", href: "/dashboard/finance", icon: WalletCards, perm: "finance.read" },
    { label: "چک‌ها", href: "/dashboard/checks", icon: ClipboardCheck, perm: "checks.read" },
    { label: "گزارش‌ها", href: "/dashboard/reports", icon: BarChart3, perm: "reports.read" },
    { label: "تنظیمات", href: "/dashboard/settings", icon: Settings, perm: "*" }
  ]}
];

function canSee(user: Pick<Session, "role" | "permissions">, perm?: string) {
  if (!perm) return true;
  if (user.role === "ADMIN" || user.permissions.includes("*")) return true;
  return user.permissions.includes(perm);
}

const roleLabel: Record<string, string> = {
  ADMIN: "مدیر سیستم", SELLER: "فروشنده", ACCOUNTANT: "حسابدار", WAREHOUSE: "انباردار", CUSTOMER: "مشتری"
};

export default function Sidebar({ open = false, onClose, user }: { open?: boolean; onClose?: () => void; user: Pick<Session, "id" | "name" | "role" | "permissions"> }) {
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
    <aside className={`${open ? "translate-x-0" : "translate-x-full lg:translate-x-0"} fixed right-0 top-0 z-50 flex h-screen w-[285px] flex-col border-l border-[var(--border)] bg-[var(--surface)] p-4 transition lg:sticky lg:top-0 lg:z-0 lg:h-screen`}>
      <div className="flex items-center justify-between px-2 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-[var(--primary)] font-black text-white">آ</div>
          <div><b>ابزارینو</b><div className="text-[10px] text-[var(--muted)]">مدیریت فروشگاه</div></div>
        </Link>
        <button className="lg:hidden" type="button" onClick={onClose}><X size={20} /></button>
      </div>
      <div className="my-3 rounded-xl bg-[var(--surface-2)] px-3 py-2.5">
        <div className="truncate text-sm font-bold">{user.name}</div>
        <div className="text-[11px] text-[var(--muted)]">{roleLabel[user.role] || user.role}</div>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto pb-4">
        {groups.map((g) => {
          const visible = g.items.filter((i) => canSee(user, i.perm));
          if (!visible.length) return null;
          return (
            <div key={g.label}>
              <div className="px-3 text-[11px] font-bold text-[var(--muted)]">{g.label}</div>
              <div className="mt-2 space-y-1">
                {visible.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link onClick={onClose} href={item.href} key={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold ${active ? "bg-[var(--primary)] text-white" : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"}`}>
                      <Icon size={18} />{item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
      <div className="space-y-2 pt-2">
        <Link href="/" className="flex items-center gap-2 rounded-xl bg-[var(--surface-2)] px-3 py-3 text-sm font-bold"><Store size={17} /> مشاهده فروشگاه <span className="mr-auto">↗</span></Link>
        <button type="button" onClick={logout} disabled={loggingOut} className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold text-red-500 hover:bg-red-50 disabled:opacity-60 dark:hover:bg-red-950/30"><LogOut size={17} />{loggingOut ? "در حال خروج..." : "خروج از حساب"}</button>
      </div>
    </aside>
  );
}
