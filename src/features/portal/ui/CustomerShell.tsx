"use client";

import {
  LayoutDashboard,
  ShoppingBag,
  MapPin,
  Heart,
  Bell,
  UserRound,
} from "lucide-react";
import PortalShell from "./PortalShell";

const groups = [
  {
    label: "حساب من",
    items: [
      { href: "/customer", label: "نمای کلی", icon: LayoutDashboard },
      { href: "/customer/orders", label: "سفارش‌ها", icon: ShoppingBag },
      { href: "/customer/addresses", label: "آدرس‌ها", icon: MapPin },
      { href: "/customer/wishlist", label: "علاقه‌مندی‌ها", icon: Heart },
      { href: "/customer/notifications", label: "اعلان‌ها", icon: Bell },
      { href: "/customer/profile", label: "پروفایل", icon: UserRound },
    ],
  },
];

export default function CustomerShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  return (
    <PortalShell
      userName={userName}
      roleLabel="مشتری"
      brandTitle="ابزار احمدی"
      brandSubtitle="حساب کاربری"
      groups={groups}
      homeHref="/customer"
    >
      {children}
    </PortalShell>
  );
}
