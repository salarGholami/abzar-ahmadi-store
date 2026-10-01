"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";

export default function Compare() {
  const [items, setItems] = useState<Product[]>([]);
  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem("compare") || "[]") as string[];
      fetch("/api/products").then(r => r.json()).then(j => setItems((j.data || []).filter((p: Product) => ids.includes(p.id))));
    } catch {}
  }, []);
  const rows: [string, (p: Product) => string][] = [
    ["قیمت", p => `${Number(p.price * (1 - (p.discount || 0) / 100)).toLocaleString("fa-IR")} تومان`],
    ["برند", p => p.brand],
    ["دسته‌بندی", p => p.category],
    ["SKU", p => p.sku],
    ["موجودی", p => p.stock > 0 ? "موجود" : "ناموجود"],
    ["امتیاز", p => p.rating ? `${p.rating} / 5` : "-"],
  ];
  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-black">مقایسه محصولات</h1>
        {!items.length ? (
          <div className="card mt-6 p-10 text-center">
            محصولی برای مقایسه انتخاب نشده است.
            <div className="mt-5"><Link href="/products" className="btn btn-primary">مشاهده محصولات</Link></div>
          </div>
        ) : (
          <div className="mt-7 overflow-x-auto card">
            <table className="min-w-[700px] w-full text-right">
              <thead><tr className="border-b border-[var(--border)]"><th className="p-4">مشخصه</th>{items.map(p => <th key={p.id} className="p-5 align-top"><div className="font-black">{p.title}</div><div className="mt-2 text-xs text-[var(--muted)]">{p.brand}</div></th>)}</tr></thead>
              <tbody>
                {rows.map(([label, fn]) => (
                  <tr key={label} className="border-b border-[var(--border)] last:border-0">
                    <th className="p-4 font-bold">{label}</th>
                    {items.map(p => <td key={p.id} className="p-4 font-medium">{fn(p)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
