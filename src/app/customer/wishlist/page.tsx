"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EmptyState, PageHeader, money } from "@/features/portal/ui/PortalUI";

type Product = { id: string; title: string; price: number; image: string; brand?: string };

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/wishlist");
        const j = await r.json();
        if (!j.success) {
          setError(j.error?.message || "خطا");
          setProducts([]);
          return;
        }
        const ids: string[] = j.data?.productIds || [];
        if (!ids.length) {
          setProducts([]);
          return;
        }
        const pr = await fetch("/api/products");
        const pj = await pr.json();
        const all: Product[] = Array.isArray(pj) ? pj : pj.data || [];
        setProducts(all.filter((p) => ids.includes(p.id)));
      } catch {
        setError("خطا در دریافت علاقه‌مندی‌ها");
        setProducts([]);
      }
    })();
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader title="علاقه‌مندی‌ها" description="محصولاتی که ذخیره کرده‌اید." />
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}
      {!products ? (
        <EmptyState message="در حال بارگذاری..." />
      ) : !products.length ? (
        <EmptyState message="لیست علاقه‌مندی‌ها خالی است." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition hover:border-[var(--primary)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt="" className="aspect-square w-full bg-[var(--surface-2)] object-cover" />
              <div className="p-4">
                <div className="text-xs text-[var(--muted)]">{p.brand}</div>
                <div className="mt-1 line-clamp-2 font-bold">{p.title}</div>
                <div className="mt-2 font-black tabular-nums">{money(p.price)} ت</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
