"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { GitCompareArrows, X } from "lucide-react";
import EmptyState from "@/shared/ui/EmptyState";
import type { Product } from "@/lib/types";

export default function Compare() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    try {
      const ids = JSON.parse(
        localStorage.getItem("compare") || "[]",
      ) as string[];
      if (!ids.length) {
        setItems([]);
        setLoading(false);
        return;
      }
      fetch("/api/products")
        .then((r) => r.json())
        .then((j) => {
          setItems(
            (j.data || []).filter((p: Product) => ids.includes(p.id)),
          );
        })
        .finally(() => setLoading(false));
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = (id: string) => {
    try {
      const ids = (
        JSON.parse(localStorage.getItem("compare") || "[]") as string[]
      ).filter((x) => x !== id);
      localStorage.setItem("compare", JSON.stringify(ids));
      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch {
      /* ignore */
    }
  };

  const clearAll = () => {
    localStorage.removeItem("compare");
    setItems([]);
  };

  const rows: [string, (p: Product) => string][] = [
    [
      "قیمت",
      (p) =>
        `${Number(p.price * (1 - (p.discount || 0) / 100)).toLocaleString("fa-IR")} تومان`,
    ],
    ["برند", (p) => p.brand || "—"],
    ["دسته‌بندی", (p) => p.category || "—"],
    ["SKU", (p) => p.sku || "—"],
    ["موجودی", (p) => (p.stock > 0 ? "موجود" : "ناموجود")],
    ["امتیاز", (p) => (p.rating ? `${p.rating} / ۵` : "—")],
  ];

  return (
    <main dir="rtl" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            مقایسه محصولات
          </h1>
          <p className="mt-1.5 text-sm text-[var(--muted)]">
            حداکثر ۴ محصول را کنار هم مقایسه کنید
          </p>
        </div>
        {items.length > 0 ? (
          <button
            type="button"
            onClick={clearAll}
            className="text-sm font-bold text-[var(--danger)] transition hover:underline"
          >
            پاک کردن همه
          </button>
        ) : null}
      </header>

      {loading ? (
        <div
          className="card animate-pulse p-10 text-center text-sm text-[var(--muted)]"
          aria-busy="true"
        >
          در حال بارگذاری...
        </div>
      ) : !items.length ? (
        <EmptyState
          icon={<GitCompareArrows size={28} aria-hidden />}
          title="محصولی برای مقایسه انتخاب نشده"
          description="از کارت محصولات یا صفحه جزئیات، گزینه «افزودن به مقایسه» را بزنید."
          actionHref="/products"
          actionLabel="مشاهده محصولات"
        />
      ) : (
        <div className="overflow-x-auto rounded-[22px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_2px_12px_rgba(0,0,0,0.035)]">
          <table className="min-w-[700px] w-full text-right">
            <caption className="sr-only">جدول مقایسه محصولات انتخاب‌شده</caption>
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th scope="col" className="p-4 text-sm font-extrabold">
                  مشخصه
                </th>
                {items.map((p) => {
                  const img =
                    p.images?.[0]?.url || p.image || "/placeholder-product.svg";
                  return (
                    <th key={p.id} scope="col" className="p-5 align-top">
                      <div className="relative mx-auto mb-3 size-20 overflow-hidden rounded-xl bg-[var(--surface-2)]">
                        <Image
                          src={img}
                          alt={p.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <Link
                        href={`/products/${p.id}`}
                        className="block font-extrabold text-[var(--text)] transition hover:text-[var(--primary)]"
                      >
                        {p.title}
                      </Link>
                      <div className="mt-1 text-xs font-bold text-[var(--muted)]">
                        {p.brand}
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(p.id)}
                        className="mt-3 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-[var(--danger)] transition hover:bg-red-500/10"
                        aria-label={`حذف ${p.title} از مقایسه`}
                      >
                        <X size={14} aria-hidden />
                        حذف
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, fn]) => (
                <tr
                  key={label}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <th
                    scope="row"
                    className="p-4 text-sm font-bold text-[var(--muted)]"
                  >
                    {label}
                  </th>
                  {items.map((p) => (
                    <td key={p.id} className="p-4 text-sm font-medium">
                      {fn(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
