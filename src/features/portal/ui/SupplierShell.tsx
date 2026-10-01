"use client";

import {
  LayoutDashboard,
  Package,
  ClipboardList,
  FileText,
  Wallet,
  UserRound,
  Bell,
  LifeBuoy,
} from "lucide-react";
import PortalShell from "./PortalShell";

const groups = [
  {
    label: "عملیات",
    items: [
      { href: "/supplier", label: "نمای کلی", icon: LayoutDashboard },
      { href: "/supplier/products", label: "محصولات من", icon: Package },
      { href: "/supplier/orders", label: "سفارش‌های خرید", icon: ClipboardList },
      { href: "/supplier/invoices", label: "فاکتورها", icon: FileText },
    ],
  },
  {
    label: "مالی و حساب",
    items: [
      { href: "/supplier/finance", label: "حساب مالی", icon: Wallet },
      { href: "/supplier/profile", label: "پروفایل", icon: UserRound },
      { href: "/supplier/notifications", label: "اعلان‌ها", icon: Bell },
      { href: "/supplier/support", label: "پشتیبانی", icon: LifeBuoy },
    ],
  },
];

export default function SupplierShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  return (
    <PortalShell
      userName={userName}
      roleLabel="تأمین‌کننده"
      brandTitle="ابزار احمدی"
      brandSubtitle="پنل تأمین‌کننده"
      groups={groups}
      homeHref="/supplier"
    >
      {children}
    </PortalShell>
  );
}
