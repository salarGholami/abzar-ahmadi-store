"use client";

import { useState } from "react";
import { useAdminCollection } from "@/features/admin/hooks";
import type { AdminCollection } from "@/features/admin/api";
import Pagination from "@/shared/ui/Pagination";

export default function AdminCollection({
  title,
  collection,
  columns,
}: {
  title: string;
  collection: AdminCollection;
  columns: string[];
}) {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const query = useAdminCollection<Record<string, unknown>>(collection, {
    page,
    pageSize: 20,
    q,
  });
  const rows = query.data?.items ?? [];
  const keyMap: Record<string, string> = {
    "نام": "name", "کد": "code", "وضعیت": "status", "مقدار": "value",
    "فعال": "active", "عنوان": "title", "محصول": "productId",
    "امتیاز": "rating", "سفارش": "saleId", "کاربر": "userId",
    "دلیل": "reason", "پیام": "message", "نوع": "type", "خوانده": "read",
    "اسلاگ": "slug",
  };

  return (
    <main dir="rtl" className="p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div><div className="text-xs font-bold text-[var(--primary)]">مدیریت فروشگاه</div><h1 className="mt-1 text-2xl font-black">{title}</h1></div>
        <button className="btn btn-secondary" onClick={() => void query.refetch()}>بروزرسانی</button>
      </div>
      <div className="mb-4 max-w-xl">
        <input
          className="input w-full"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="جست‌وجو در اطلاعات..."
        />
      </div>
      <div className="card overflow-x-auto">
        {query.isLoading ? <div className="p-8">در حال بارگذاری...</div> :
         query.error ? <div className="p-8 text-red-600">{query.error.message}</div> :
         <table className="min-w-full text-sm">
          <thead><tr className="border-b border-[var(--border)]">{columns.map((c) => <th key={c} className="whitespace-nowrap p-4 text-right font-black">{c}</th>)}</tr></thead>
          <tbody>
            {rows.map((row) => <tr key={String(row.id)} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]">
              {columns.map((column, index) => <td key={column} className="whitespace-nowrap p-4">{index === 0 ? String(row.id || "-").slice(0, 10) : String(row[column] ?? row[keyMap[column]] ?? "-")}</td>)}
            </tr>)}
            {!rows.length && <tr><td colSpan={columns.length} className="p-10 text-center text-[var(--muted)]">داده‌ای وجود ندارد.</td></tr>}
          </tbody>
        </table>}
        {query.data?.pagination ? <Pagination pagination={query.data.pagination} onPageChange={setPage} /> : null}
      </div>
    </main>
  );
}
