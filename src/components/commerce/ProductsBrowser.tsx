"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Filter, Search, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Category, Product } from "@/lib/types";

type Sort = "popular" | "cheap" | "expensive" | "stock";
type StockFilter = "all" | "available";

const PAGE_SIZE = 24;

export default function ProductsBrowser({
  products,
  categories,
  initialCategory,
  initialBrand,
  initialQuery,
}: {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
  initialBrand?: string;
  initialQuery?: string;
}) {
  const [q, setQ] = useState(initialQuery || "");
  const [category, setCategory] = useState(initialCategory || "");
  const [brand, setBrand] = useState(initialBrand || "");
  const [sort, setSort] = useState<Sort>("popular");
  const [stock, setStock] = useState<StockFilter>("all");
  const [maxPrice, setMaxPrice] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const brands = useMemo(() => Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).sort(), [products]);
  const availableCategories = categories.filter((item) => item.active !== false);
  const maxProductPrice = Math.max(...products.map((product) => product.price), 0);

  const filtered = useMemo(() => {
    const normalized = q.trim().toLowerCase();
    let list = products.filter((product) => {
      const matchesQuery = !normalized || `${product.title} ${product.brand} ${product.sku} ${product.category}`.toLowerCase().includes(normalized);
      const matchesCategory = !category || product.category === category;
      const matchesBrand = !brand || product.brand === brand;
      const matchesStock = stock === "all" || product.stock > 0;
      const matchesPrice = !maxPrice || product.price <= Number(maxPrice);
      return matchesQuery && matchesCategory && matchesBrand && matchesStock && matchesPrice;
    });

    if (sort === "cheap") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "expensive") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "stock") list = [...list].sort((a, b) => b.stock - a.stock);
    return list;
  }, [products, q, category, brand, sort, stock, maxPrice]);

  useEffect(() => setVisibleCount(PAGE_SIZE), [q, category, brand, sort, stock, maxPrice]);
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const hasFilters = Boolean(q || category || brand || maxPrice || stock !== "all");

  function clearFilters() {
    setQ("");
    setCategory("");
    setBrand("");
    setMaxPrice("");
    setStock("all");
    setSort("popular");
  }

  const FilterPanel = () => (
    <div className="space-y-5">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-black">دسته‌بندی</span>
          <ChevronDown size={16} className="text-[var(--muted)]" />
        </div>
        <div className="space-y-1">
          <button type="button" onClick={() => setCategory("")} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm ${!category ? "bg-[var(--primary)]/10 font-black text-[var(--primary)]" : "text-[var(--muted)] hover:bg-[var(--surface-2)]"}`}>
            <span>همه دسته‌بندی‌ها</span><span>{products.length.toLocaleString("fa-IR")}</span>
          </button>
          {availableCategories.map((item) => {
            const count = products.filter((product) => product.category === item.name).length;
            return (
              <button key={item.id} type="button" onClick={() => setCategory(item.name)} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-right text-sm ${category === item.name ? "bg-[var(--primary)]/10 font-black text-[var(--primary)]" : "text-[var(--muted)] hover:bg-[var(--surface-2)]"}`}>
                <span>{item.name}</span><span>{count.toLocaleString("fa-IR")}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[var(--border)] pt-5">
        <div className="mb-3 text-sm font-black">برند</div>
        <div className="max-h-56 space-y-1 overflow-y-auto pl-1">
          {brands.map((item) => (
            <label key={item} className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2.5 text-sm text-[var(--muted)] hover:bg-[var(--surface-2)]">
              <input type="checkbox" checked={brand === item} onChange={() => setBrand(brand === item ? "" : item)} className="size-4 accent-[var(--primary)]" />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--border)] pt-5">
        <div className="mb-3 text-sm font-black">موجودی</div>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2.5 text-sm text-[var(--muted)]">
          <input type="checkbox" checked={stock === "available"} onChange={(e) => setStock(e.target.checked ? "available" : "all")} className="size-4 accent-[var(--primary)]" />
          فقط کالاهای موجود
        </label>
      </div>

      <div className="border-t border-[var(--border)] pt-5">
        <div className="mb-3 flex items-center justify-between text-sm font-black">
          <span>محدوده قیمت</span>
          <span className="text-xs font-bold text-[var(--muted)]">{maxPrice ? `${Number(maxPrice).toLocaleString("fa-IR")} تومان` : "بدون محدودیت"}</span>
        </div>
        <input type="range" min={0} max={Math.max(maxProductPrice, 1)} step={10000} value={Number(maxPrice || maxProductPrice)} onChange={(e) => setMaxPrice(e.target.value === String(maxProductPrice) ? "" : e.target.value)} className="w-full accent-[var(--primary)]" />
        <div className="mt-2 flex justify-between text-[10px] text-[var(--muted)]">
          <span>۰ تومان</span><span>{maxProductPrice.toLocaleString("fa-IR")} تومان</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="mb-7">
        <div className="text-xs font-black text-[var(--primary)]">کاتالوگ آنلاین</div>
        <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">ابزار موردنیاز پروژه‌ات</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{filtered.length.toLocaleString("fa-IR")} محصول از {products.length.toLocaleString("fa-IR")} محصول</p>
      </div>

      <div className="mb-5 flex flex-col gap-3 lg:hidden">
        <div className="relative">
          <Search className="absolute right-3 top-3.5 text-[var(--muted)]" size={17} />
          <input value={q} onChange={(e) => setQ(e.target.value)} className="input pr-10" placeholder="نام محصول، برند یا SKU..." />
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setMobileFiltersOpen(true)} className="btn btn-secondary flex-1"><Filter size={16} />فیلترها</button>
          <select className="input max-w-[190px]" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="popular">مرتب‌سازی: پیش‌فرض</option>
            <option value="cheap">ارزان‌ترین</option>
            <option value="expensive">گران‌ترین</option>
            <option value="stock">بیشترین موجودی</option>
          </select>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button type="button" onClick={() => setMobileFiltersOpen(false)} className="absolute inset-0 bg-black/45" aria-label="بستن فیلترها" />
          <aside className="absolute right-0 top-0 h-full w-[min(88vw,390px)] overflow-y-auto bg-[var(--surface)] p-4 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div className="flex items-center gap-2 font-black"><SlidersHorizontal size={18} />فیلترها</div>
              <button type="button" onClick={() => setMobileFiltersOpen(false)} className="btn btn-secondary !size-10 !p-0"><X size={18} /></button>
            </div>
            <FilterPanel />
            <div className="mt-6 flex gap-2 border-t border-[var(--border)] pt-4">
              <button type="button" onClick={clearFilters} className="btn btn-secondary flex-1">پاک کردن</button>
              <button type="button" onClick={() => setMobileFiltersOpen(false)} className="btn btn-primary flex-1">نمایش {filtered.length.toLocaleString("fa-IR")} محصول</button>
            </div>
          </aside>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="card hidden h-fit p-4 lg:block lg:sticky lg:top-24">
          <div className="mb-5 flex items-center justify-between border-b border-[var(--border)] pb-4">
            <div className="flex items-center gap-2 font-black"><Filter size={17} />فیلترها</div>
            {hasFilters && <button type="button" onClick={clearFilters} className="text-xs font-bold text-[var(--primary)]">پاک کردن</button>}
          </div>
          <FilterPanel />
        </aside>

        <section className="min-w-0">
          <div className="mb-4 hidden items-center justify-between border-b border-[var(--border)] pb-4 lg:flex">
            <div className="text-sm text-[var(--muted)]"><span className="font-black text-[var(--text)]">{filtered.length.toLocaleString("fa-IR")}</span> کالا</div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--muted)]">مرتب‌سازی:</span>
              <select className="input !w-auto !py-2 text-xs font-bold" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                <option value="popular">پیش‌فرض</option>
                <option value="cheap">ارزان‌ترین</option>
                <option value="expensive">گران‌ترین</option>
                <option value="stock">بیشترین موجودی</option>
              </select>
            </div>
          </div>

          {filtered.length ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {visible.map((product) => <ProductCard key={product.id} p={product} />)}
              </div>
              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <button type="button" onClick={() => setVisibleCount((v) => v + PAGE_SIZE)} className="btn btn-secondary px-8">
                    نمایش {Math.min(PAGE_SIZE, filtered.length - visibleCount).toLocaleString("fa-IR")} محصول بیشتر
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="card p-14 text-center">
              <div className="text-lg font-black">محصولی با این فیلترها پیدا نشد</div>
              <p className="mt-2 text-sm text-[var(--muted)]">فیلترها را تغییر دهید یا پاک کنید.</p>
              <button type="button" onClick={clearFilters} className="btn btn-primary mt-5">پاک کردن فیلترها</button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
