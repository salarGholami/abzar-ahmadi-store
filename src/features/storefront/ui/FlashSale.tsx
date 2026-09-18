"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Product } from "@/domains/catalog";
import { useCountdownToEndOfDay } from "../hooks/useCountdown";
import FlashSaleHeader from "./flash-sale/FlashSaleHeader";
import FlashSaleTimer from "./flash-sale/FlashSaleTimer";
import FlashSaleProducts from "./flash-sale/FlashSaleProducts";

export default function FlashSale({ products }: { products: Product[] }) {
  const timer = useCountdownToEndOfDay();
  if (!products.length) return null;

  return (
    <section className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)]">
        <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-[var(--primary)]/[0.06] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-72 rounded-full bg-[var(--primary)]/[0.035] blur-3xl" />
        <div className="relative z-10 p-4 sm:p-5 lg:p-7">
          <div className="flex flex-col gap-4 lg:hidden"><FlashSaleHeader /><FlashSaleTimer {...timer} /></div>
          <div className="hidden lg:block"><FlashSaleHeader /><div className="mt-7"><FlashSaleTimer {...timer} /></div></div>
          <div className="my-5 h-px bg-[var(--border)] lg:my-7" />
          <FlashSaleProducts products={products} />
          <div className="mt-6 hidden justify-center lg:flex"><Link href="/products" className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-7 py-3 text-xs font-black text-[var(--text)] hover:border-[var(--primary)]/50 hover:text-[var(--primary)]">مشاهده همه تخفیف‌ها<ArrowLeft size={15} className="transition-transform group-hover:-translate-x-1" /></Link></div>
        </div>
      </div>
    </section>
  );
}
