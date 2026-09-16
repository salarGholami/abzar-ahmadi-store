"use client";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/types";

type Sort = "popular" | "cheap" | "expensive";

export default function ProductsBrowser({ products, initialCategory }: { products: Product[]; initialCategory?: string }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState(initialCategory || "");
  const [sort, setSort] = useState<Sort>("popular");

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category).filter(Boolean))), [products]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => (p.title + p.brand + p.sku).toLowerCase().includes(q.toLowerCase()));
    if (category) list = list.filter((p) => p.category === category);
    if (sort === "cheap") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "expensive") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, q, category, sort]);

  return (
    <>
      <div className="mb-8">
        <div className="text-sm font-bold text-[var(--primary)]">کاتالوگ</div>
        <h1 className="mt-1 text-3xl font-black">همه محصولات</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{filtered.length} محصول آماده سفارش</p>
      </div>
      <div className="mb-6 grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:grid-cols-[1fr_220px_180px]">
        <div className="relative">
          <Search className="absolute right-3 top-3" size={17} />
          <input value={q} onChange={(e) => setQ(e.target.value)} className="input pr-10" placeholder="جستجو بر اساس نام، برند یا SKU..." />
        </div>
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">همه دسته‌بندی‌ها</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
          <option value="popular">مرتب‌سازی: محبوب‌ترین</option>
          <option value="cheap">ارزان‌ترین</option>
          <option value="expensive">گران‌ترین</option>
        </select>
      </div>
      {filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      ) : (
        <div className="card p-10 text-center text-[var(--muted)]">محصولی با این مشخصات یافت نشد</div>
      )}
    </>
  );
}
