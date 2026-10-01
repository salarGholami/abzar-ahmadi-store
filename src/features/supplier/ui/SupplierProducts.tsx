"use client";

import { useState } from "react";
import { EmptyState, PageHeader, money } from "@/features/portal/ui/PortalUI";
import Pagination from "@/shared/ui/Pagination";
import { useSupplierProducts } from "../hooks";

export default function SupplierProducts() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const { data, isLoading, error } = useSupplierProducts({ page, pageSize: 20, q });
  const rows = data?.items ?? [];

  return <div className="space-y-5">
    <PageHeader title="محصولات من" description="محصولاتی که مدیر فروشگاه به حساب تأمین‌کننده شما تخصیص داده است." actions={
      <input
        className="h-11 w-full min-w-[200px] rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm sm:w-64"
        placeholder="جستجو نام، برند، SKU..."
        value={q}
        onChange={(e) => { setQ(e.target.value); setPage(1); }}
      />
    } />
    {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error.message}</div> : null}
    {isLoading ? <EmptyState message="در حال بارگذاری..." /> : !rows.length ? <EmptyState message="محصولی یافت نشد." /> : (
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-[var(--surface-2)] text-xs text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 text-right font-bold">محصول</th>
                <th className="px-4 py-3 text-right font-bold">برند / SKU</th>
                <th className="px-4 py-3 text-right font-bold">دسته‌بندی</th>
                <th className="px-4 py-3 text-right font-bold">قیمت (ت)</th>
                <th className="px-4 py-3 text-right font-bold">موجودی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-bold">{r.title}</td>
                  <td className="px-4 py-3">{r.brand || "—"} / {r.sku || "—"}</td>
                  <td className="px-4 py-3">{r.category || "—"}</td>
                  <td className="px-4 py-3 font-black tabular-nums">{money(r.price)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${r.stock > 0 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"}`}>
                      {r.stock > 0 ? money(r.stock) : "ناموجود"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data?.pagination ? <Pagination pagination={data.pagination} onPageChange={setPage} /> : null}
      </div>
    )}
  </div>;
}
