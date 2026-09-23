"use client";

import Link from "next/link";
import { Package, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useCustomerOrders } from "../hooks";
import Pagination from "@/shared/ui/Pagination";

export default function CustomerOrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useCustomerOrders({ page, pageSize: 10 });
  const orders = data?.items ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div><h1 className="text-xl font-black">سفارش‌های من</h1><p className="mt-1 text-sm text-[var(--muted)]">لیست سفارش‌های ثبت‌شده</p></div>
        <button type="button" onClick={() => void refetch()} className="btn btn-secondary"><RefreshCw size={16} /> بروزرسانی</button>
      </div>
      {isLoading ? <div className="card p-8 text-center text-sm text-[var(--muted)]">در حال بارگذاری...</div> :
       error ? <div className="card p-8 text-center text-sm text-red-600">{error.message}</div> :
       !orders.length ? <div className="card p-8 text-center text-sm text-[var(--muted)]"><Package className="mx-auto mb-3 opacity-50" size={32} />سفارشی ثبت نشده است.</div> :
       <div className="space-y-3">
         {orders.map((o) => <Link key={o.id} href={`/customer/orders/${o.id}`} className="card flex items-center justify-between gap-4 p-4 transition hover:border-[var(--primary)]"><div><div className="text-sm font-bold">سفارش #{String(o.id).slice(0, 8)}</div><div className="mt-1 text-xs text-[var(--muted)]">{new Date(o.createdAt).toLocaleString("fa-IR")}</div></div><div className="text-left text-sm font-black">{(o.netAmount ?? 0).toLocaleString("fa-IR")} تومان</div></Link>)}
         {data?.pagination ? <Pagination pagination={data.pagination} onPageChange={setPage} /> : null}
       </div>}
    </div>
  );
}
