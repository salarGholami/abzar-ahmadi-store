"use client";

import { useEffect, useState } from "react";
import { EmptyState, PageHeader, money } from "@/features/portal/ui/PortalUI";

type Row = {
  id: string;
  title: string;
  brand: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  image: string;
};

export default function SupplierProducts() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/supplier/products")
      .then((r) => r.json())
      .then((j) => {
        if (!j.success) setError(j.error?.message || "خطا");
        else setRows(j.data);
      })
      .catch(() => setError("خطا در ارتباط با سرور"));
  }, []);

  const filtered = (rows || []).filter((r) => {
    const s = q.trim();
    if (!s) return true;
    return [r.title, r.brand, r.sku, r.category].join(" ").includes(s);
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="محصولات من"
        description="محصولاتی که مدیر فروشگاه به حساب تأمین‌کننده شما تخصیص داده است."
        actions={
          <input
            className="h-11 w-full min-w-[200px] rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm sm:w-64"
            placeholder="جستجو نام، برند، SKU..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        }
      />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {!rows ? (
        <EmptyState message="در حال بارگذاری..." />
      ) : !filtered.length ? (
        <EmptyState message="محصولی یافت نشد." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-[var(--surface-2)] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 text-right font-semibold">محصول</th>
                  <th className="px-4 py-3 text-right font-semibold">برند / SKU</th>
                  <th className="px-4 py-3 text-right font-semibold">دسته</th>
                  <th className="px-4 py-3 text-right font-semibold">قیمت فروش</th>
                  <th className="px-4 py-3 text-right font-semibold">موجودی</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-[var(--surface-2)]/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={r.image || "/placeholder.png"}
                          alt=""
                          className="size-11 rounded-xl object-cover bg-[var(--surface-2)]"
                        />
                        <div className="font-bold text-[var(--text)]">{r.title}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{r.brand}</div>
                      <div className="text-xs text-[var(--muted)]">{r.sku}</div>
                    </td>
                    <td className="px-4 py-3">{r.category}</td>
                    <td className="px-4 py-3 font-black tabular-nums">{money(r.price)}</td>
                    <td className="px-4 py-3 tabular-nums">{money(r.stock)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-[var(--border)] px-4 py-3 text-xs text-[var(--muted)]">
            {money(filtered.length)} محصول
          </div>
        </div>
      )}
    </div>
  );
}
