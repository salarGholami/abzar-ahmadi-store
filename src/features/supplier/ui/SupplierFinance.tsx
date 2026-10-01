"use client";

import { useEffect, useState } from "react";
import { Wallet, Banknote, Receipt } from "lucide-react";
import {
  EmptyState,
  PageHeader,
  Panel,
  StatCard,
  faDate,
  money,
} from "@/features/portal/ui/PortalUI";

type FinanceData = {
  summary: {
    totalPurchases: number;
    totalAmount: number;
    cashAmount: number;
    checkAmount: number;
  };
  entries: {
    id: string;
    amount: number;
    paymentMethod: string;
    createdAt: string;
    description: string;
  }[];
};

export default function SupplierFinance() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/supplier/finance")
      .then((r) => r.json())
      .then((j) => {
        if (!j.success) setError(j.error?.message || "خطا");
        else setData(j.data);
      })
      .catch(() => setError("خطا در ارتباط با سرور"));
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader
        title="حساب مالی"
        description="خلاصه خریدها و روش‌های پرداخت مرتبط با همکاری شما."
      />
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}
      {!data ? (
        <EmptyState message="در حال بارگذاری..." />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="تعداد خرید" value={money(data.summary.totalPurchases)} icon={Receipt} />
            <StatCard label="جمع کل (تومان)" value={money(data.summary.totalAmount)} icon={Wallet} />
            <StatCard label="نقدی" value={money(data.summary.cashAmount)} icon={Banknote} />
            <StatCard label="چک" value={money(data.summary.checkAmount)} icon={Receipt} />
          </section>
          <Panel title="سوابق مالی">
            {!data.entries.length ? (
              <EmptyState message="سابقه‌ای وجود ندارد." />
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {data.entries.map((e) => (
                  <div key={e.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div>
                      <div className="font-bold">{e.description}</div>
                      <div className="mt-1 text-xs text-[var(--muted)]">
                        {faDate(e.createdAt)} · {e.paymentMethod === "CHECK" ? "چک" : "نقدی"}
                      </div>
                    </div>
                    <div className="font-black tabular-nums">{money(e.amount)} ت</div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}
