"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function CartLink() {
  const { count } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `سبد خرید، ${count.toLocaleString("fa-IR")} کالا` : "سبد خرید"}
      className="relative flex h-11 items-center gap-2 rounded-2xl bg-[var(--primary)] px-3.5 !text-white shadow-lg shadow-[var(--primary)]/20 transition hover:bg-[var(--primary-2)] hover:!text-white active:scale-[0.98] lg:h-[52px] lg:px-4"
    >
      <ShoppingBag size={18} aria-hidden />
      <span className="hidden text-[10px] font-black xl:inline">سبد خرید</span>
      {count > 0 ? (
        <span className="absolute -left-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--danger)] px-1 text-[9px] font-black ring-2 ring-[var(--surface)]">
          {count > 99 ? "۹۹+" : count.toLocaleString("fa-IR")}
        </span>
      ) : null}
    </Link>
  );
}
