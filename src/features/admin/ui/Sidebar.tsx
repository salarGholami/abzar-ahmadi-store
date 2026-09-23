"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Truck,
  Boxes,
  ReceiptText,
  WalletCards,
  ClipboardCheck,
  BarChart3,
  Settings,
  LogOut,
  Store,
  X,
  Tags,
  ChevronLeft,
  Database,
  UserCog,
  Receipt,
  ArrowDownCircle,
  ArrowUpCircle,
  ScrollText,
  Bell,
  Percent,
  UserRoundCog,
  type LucideIcon,
} from "lucide-react";

import type { Session } from "@/lib/auth";
import { useLogout } from "@/features/auth/hooks";
import { ROLE_LABEL } from "@/lib/roles";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
  ownerOnly?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const groups: NavGroup[] = [
  {
    label: "فروش و عملیات",
    items: [
      { label: "نمای کلی", href: "/dashboard", icon: LayoutDashboard, permission: "dashboard.read" },
      { label: "فروش جدید", href: "/dashboard/pos", icon: ShoppingCart, permission: "sales" },
      { label: "فروش‌ها و فاکتورها", href: "/dashboard/sales", icon: ReceiptText, permission: "sales" },
      { label: "خرید از تأمین‌کننده", href: "/dashboard/purchases", icon: Truck, permission: "purchases" },
      { label: "سفارش‌های آنلاین", href: "/dashboard/orders", icon: ClipboardCheck, permission: "sales" },
      { label: "مرجوعی‌ها", href: "/dashboard/returns", icon: ArrowDownCircle, permission: "sales" },
    ],
  },
  {
    label: "کاتالوگ و موجودی",
    items: [
      { label: "محصولات", href: "/dashboard/products", icon: Package, permission: "products" },
      { label: "دسته‌بندی‌ها", href: "/dashboard/categories", icon: Tags, permission: "products" },
      { label: "انبار", href: "/dashboard/inventory", icon: Boxes, permission: "inventory" },
      { label: "تأمین‌کنندگان", href: "/dashboard/suppliers", icon: Truck, permission: "suppliers" },
      { label: "مشتریان", href: "/dashboard/customers", icon: Users, permission: "customers" },
    ],
  },
  {
    label: "مالی و کنترل",
    items: [
      { label: "مالی", href: "/dashboard/finance", icon: WalletCards, permission: "finance" },
      { label: "چک‌ها", href: "/dashboard/checks", icon: ClipboardCheck, permission: "finance" },
      { label: "گزارش‌ها", href: "/dashboard/reports", icon: BarChart3, permission: "reports" },
      { label: "درآمدهای متفرقه", href: "/dashboard/incomes", icon: ArrowUpCircle, permission: "finance" },
      { label: "هزینه‌ها", href: "/dashboard/expenses", icon: ArrowDownCircle, permission: "finance" },
      { label: "پیش‌فاکتورها", href: "/dashboard/quotations", icon: Receipt, permission: "sales" },
      { label: "برندها", href: "/dashboard/brands", icon: Tags, permission: "products" },
      { label: "کدهای تخفیف", href: "/dashboard/coupons", icon: Percent, permission: "sales" },
      { label: "نظرات", href: "/dashboard/reviews", icon: ClipboardCheck, permission: "products" },
      { label: "روش‌های ارسال", href: "/dashboard/shipping", icon: Truck, permission: "settings" },
      { label: "بنرها", href: "/dashboard/banners", icon: Store, permission: "settings" },
      { label: "مقالات", href: "/dashboard/articles", icon: ScrollText, permission: "settings" },
      { label: "اعلان‌ها", href: "/dashboard/notifications", icon: Bell, permission: "settings" },
      { label: "لاگ فعالیت‌ها", href: "/dashboard/activity", icon: ScrollText, permission: "settings" },
      { label: "مرکز داده‌ها", href: "/dashboard/data", icon: Database, permission: "settings" },
      { label: "تنظیمات", href: "/dashboard/settings", icon: Settings, permission: "settings" },
      { label: "کاربران و دسترسی‌ها", href: "/dashboard/users", icon: UserRoundCog, ownerOnly: true },
    ],
  },
];

function canSee(item: NavItem, user: Pick<Session, "role" | "permissions" | "isOwner">) {
  if (item.ownerOnly) return user.role === "ADMIN" && user.isOwner === true;
  if (user.role !== "ADMIN") return false;
  if (!item.permission) return true;
  return user.permissions.includes("*") || user.permissions.includes(item.permission);
}

function getGroupsForRole(
  user: Pick<Session, "role" | "permissions" | "isOwner">,
): NavGroup[] {
  if (user.role === "ADMIN") {
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => canSee(item, user)),
      }))
      .filter((group) => group.items.length > 0);
  }

  if (user.role === "SUPPLIER") {
    return [
      {
        label: "پنل تأمین‌کننده",
        items: [
          { label: "نمای کلی", href: "/supplier", icon: LayoutDashboard },
          { label: "محصولات من", href: "/supplier/products", icon: Package },
          { label: "خریدها و سفارش‌ها", href: "/supplier/orders", icon: ClipboardCheck },
          { label: "مالی", href: "/supplier/finance", icon: WalletCards },
          { label: "فاکتورها", href: "/supplier/invoices", icon: Receipt },
          { label: "اعلان‌ها", href: "/supplier/notifications", icon: Bell },
          { label: "پشتیبانی", href: "/supplier/support", icon: ScrollText },
          { label: "پروفایل", href: "/supplier/profile", icon: UserCog },
        ],
      },
    ];
  }

  return [
    {
      label: "حساب مشتری",
      items: [
        { label: "نمای کلی", href: "/customer", icon: LayoutDashboard },
        { label: "سفارش‌ها", href: "/customer/orders", icon: ClipboardCheck },
        { label: "آدرس‌ها", href: "/customer/addresses", icon: Store },
        { label: "علاقه‌مندی‌ها", href: "/customer/wishlist", icon: Package },
        { label: "اعلان‌ها", href: "/customer/notifications", icon: Bell },
        { label: "پروفایل", href: "/customer/profile", icon: UserCog },
      ],
    },
  ];
}

export default function Sidebar({
  open = false,
  collapsed = false,
  onClose,
  user,
}: {
  open?: boolean;
  collapsed?: boolean;
  onClose?: () => void;
  user: Pick<
    Session,
    "id" | "name" | "phone" | "role" | "permissions" | "supplierId" | "isOwner"
  >;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const logoutMutation = useLogout();

  async function logout() {
    await logoutMutation.mutateAsync();
    router.push("/account");
    router.refresh();
  }

  const groupsForRole = getGroupsForRole(user);

  const roleLabel =
    user.role === "ADMIN" && user.isOwner
      ? "مدیر اصلی"
      : ROLE_LABEL[user.role];

  const homeHref =
    user.role === "ADMIN"
      ? "/dashboard"
      : user.role === "SUPPLIER"
        ? "/supplier"
        : "/customer";

  return (
    <aside
      className={`fixed right-0 top-0 z-[110] flex h-dvh max-w-[calc(100vw-12px)] flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-2xl shadow-black/10 transition-[width,transform] duration-200 lg:shadow-none ${
        open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      } ${collapsed ? "w-[88px]" : "w-[292px]"}`}
    >
      <div className="flex h-[72px] shrink-0 items-center border-b border-[var(--border)] px-4">
        <Link href={homeHref} onClick={onClose} className="flex min-w-0 items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--primary)] text-lg font-black text-white shadow-lg shadow-[var(--primary)]/20">
            آ
          </div>

          {!collapsed ? (
            <div className="min-w-0">
              <div className="truncate text-sm font-black text-[var(--text)]">ابزار احمدی</div>
              <div className="mt-0.5 truncate text-[10px] font-medium text-[var(--muted)]">
                {user.role === "SUPPLIER"
                  ? "پنل اختصاصی تأمین‌کننده"
                  : "مدیریت یکپارچه فروشگاه"}
              </div>
            </div>
          ) : null}
        </Link>

        <button
          type="button"
          onClick={onClose}
          aria-label="بستن منو"
          className="mr-auto inline-flex size-10 shrink-0 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      {!collapsed ? (
        <div className="mx-3 mt-4 shrink-0 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
          <div className="text-[10px] font-bold text-[var(--muted)]">حساب فعال</div>
          <div className="mt-1.5 truncate text-sm font-black text-[var(--text)]">{user.name}</div>
          <div className="mt-2 inline-flex rounded-full bg-[var(--primary)]/10 px-2 py-1 text-[10px] font-bold text-[var(--primary)]">
            {roleLabel}
          </div>
          {user.role === "SUPPLIER" && user.supplierId ? (
            <div className="mt-2 text-[10px] text-[var(--muted)]">شناسه تأمین‌کننده: {user.supplierId}</div>
          ) : null}
        </div>
      ) : null}

      <nav className="mt-4 min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-3 pb-4 [scrollbar-width:thin]">
        {groupsForRole.map((group) => (
          <div key={group.label}>
            {!collapsed ? (
              <div className="px-3 text-[10px] font-black tracking-wide text-[var(--muted)]">{group.label}</div>
            ) : null}

            <div className="mt-2 space-y-1">
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== homeHref && pathname.startsWith(`${item.href}/`));
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
                    {!collapsed ? <span className="truncate">{item.label}</span> : null}
                    {!collapsed && active ? <ChevronLeft className="mr-auto shrink-0" size={15} /> : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 space-y-2 border-t border-[var(--border)] bg-[var(--surface)] p-3">
        <Link
          href="/"
          onClick={onClose}
          className={`flex items-center gap-2 rounded-2xl bg-[var(--surface-2)] px-3 py-3 text-sm font-bold text-[var(--text)] transition hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] ${collapsed ? "justify-center" : ""}`}
        >
          <Store size={17} />
          {!collapsed ? <><span>مشاهده فروشگاه</span><span className="mr-auto">↗</span></> : null}
        </Link>

        <button
          type="button"
          onClick={logout}
          disabled={logoutMutation.isPending}
          className={`flex w-full items-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-red-950/30 ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut size={17} />
          {!collapsed ? (logoutMutation.isPending ? "در حال خروج..." : "خروج از حساب") : null}
        </button>
      </div>
    </aside>
  );
}
