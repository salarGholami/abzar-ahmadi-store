"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import ProductCard from "@/features/storefront/ui/ProductCard";
import EmptyState from "@/shared/ui/EmptyState";
import { ProductGridSkeleton } from "@/shared/ui/Skeleton";
import type { Product } from "@/lib/types";

export default function Wishlist() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/wishlist").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ])
      .then(([w, p]) => {
        const ids: string[] = w.data?.productIds || [];
        setProducts(
          (p.data || []).filter((x: Product) => ids.includes(x.id)),
        );
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main dir="rtl" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          علاقه‌مندی‌ها
        </h1>
        <p className="mt-1.5 text-sm text-[var(--muted)]">
          محصولاتی که برای بعد ذخیره کرده‌اید
        </p>
      </header>

      {loading ? (
        <ProductGridSkeleton count={4} />
      ) : !products.length ? (
        <EmptyState
          icon={<Heart size={28} aria-hidden />}
          title="لیست علاقه‌مندی خالی است"
          description="محصولات مورد علاقه‌تان را با ضربه روی آیکون قلب ذخیره کنید تا بعداً راحت پیدا کنید."
          actionHref="/products"
          actionLabel="مشاهده محصولات"
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </main>
  );
}
