"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Product } from "@/lib/types";
import { useProducts } from "@/features/catalog/hooks";

export default function RecentlyViewed() {
  const { data: products = [] } = useProducts();
  const items = useMemo(() => {
    if (typeof window === "undefined") return [];
    try {
      const ids = JSON.parse(localStorage.getItem("recentlyViewed") || "[]") as string[];
      return ids
        .map((id) => products.find((product: Product) => product.id === id))
        .filter((product): product is Product => Boolean(product))
        .slice(0, 6);
    } catch {
      return [];
    }
  }, [products]);

  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs font-bold text-[var(--primary)]">برگشت سریع</div>
          <h2 className="mt-1 text-2xl font-black">آخرین بازدیدها</h2>
        </div>
        <Link href="/products" className="text-sm font-bold text-[var(--primary)]">مشاهده فروشگاه</Link>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((product) => (
          <Link key={product.id} href={`/products/${product.id}`} className="card p-3">
            <div className="line-clamp-2 text-sm font-bold">{product.title}</div>
            <div className="mt-3 text-xs font-black">
              {Number(product.price * (1 - (product.discount || 0) / 100)).toLocaleString("fa-IR")} تومان
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
