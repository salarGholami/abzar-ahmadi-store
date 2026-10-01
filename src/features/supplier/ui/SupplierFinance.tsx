"use client";

import { useState } from "react";
import { Wallet, Banknote, Receipt } from "lucide-react";
import { EmptyState, PageHeader, Panel, StatCard, faDate, money } from "@/features/portal/ui/PortalUI";
import Pagination from "@/shared/ui/Pagination";
import { useSupplierFinance } from "../hooks";

export default function SupplierFinance() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useSupplierFinance({ page, pageSize: 10 });

  return <div className="space-y-5">
    <PageHeader title="حساب مالی" description="خلاصه خریدها و روش‌های پرداخت مرتبط با همکاری شما." />
    {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error.message}</div> : null}
    {isLoading || !data ? <EmptyState message="در حال بارگذاری..." /> : <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="تعداد خرید" value={money(data.summary.totalPurchases)} icon={Receipt} />
        <StatCard label="جمع کل (تومان)" value={money(data.summary.totalAmount)} icon={Wallet} />
        <StatCard label="نقدی" value={money(data.summary.cashAmount)} icon={Banknote} />
        <StatCard label="چک" value={money(data.summary.checkAmount)} icon={Receipt} />
      </section>
      <Panel title="سوابق مالی">
        {!data.entries.length ? <EmptyState message="سابقه‌ای وجود ندارد." /> : (
          <div className="divide-y divide-[var(--border)]">
            {data.entries.map((e) => <div key={e.id} className="flex items-center justify-between py-3"><div><div className="font-bold">{e.description}</div><div className="mt-1 text-xs text-[var(--muted)]">{faDate(e.createdAt)} · {e.paymentMethod === "CHECK" ? "چک" : "نقدی"}</div></div><div className="font-black">{money(e.amount)} ت</div></div>)}
          </div>
        )}
        {"pagination" in data && data.pagination ? <Pagination pagination={data.pagination} onPageChange={setPage} /> : null}
      </Panel>
    </>}
  </div>;
}
