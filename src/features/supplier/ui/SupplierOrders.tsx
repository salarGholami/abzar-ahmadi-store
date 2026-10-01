"use client";

import { useEffect, useState } from "react";
import { EmptyState, PageHeader, faDate, money } from "@/features/portal/ui/PortalUI";

type Order = {
  id: string;
  subtotal: number;
  paymentMethod: string;
  createdAt: string;
  itemCount: number;
  items: {
    id: string;
    quantity: number;
    unitCost: number;
    total: number;
    productTitle: string;
    productSku: string | null;
  }[];
};

export default function SupplierOrders({ asInvoices = false }: { asInvoices?: boolean }) {
  const [rows, setRows] = useState<Order[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/supplier/orders")
      .then((r) => r.json())
      .then((j) => {
        if (!j.success) setError(j.error?.message || "خطا");
        else setRows(j.data);
      })
      .catch(() => setError("خطا در ارتباط با سرور"));
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader
        title={asInvoices ? "فاکتورها" : "سفارش‌های خرید"}
        description={
          asInvoices
            ? "اسناد خرید ثبت‌شده توسط مدیر مرتبط با حساب شما."
            : "خریدهای ثبت‌شده از حساب شما با جزئیات اقلام."
        }
      />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {!rows ? (
        <EmptyState message="در حال بارگذاری..." />
      ) : !rows.length ? (
        <EmptyState message="موردی ثبت نشده است." />
      ) : (
        <div className="space-y-3">
          {rows.map((o) => {
            const open = openId === o.id;
            return (
              <article
                key={o.id}
                className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : o.id)}
                  className="flex w-full items-center justify-between gap-4 p-4 text-right"
                >
                  <div>
                    <div className="font-black text-[var(--text)]">
                      {asInvoices ? "فاکتور" : "سفارش"} #{o.id.slice(0, 8)}
                    </div>
                    <div className="mt-1 text-xs text-[var(--muted)]">
                      {faDate(o.createdAt)} · {money(o.itemCount)} قلم ·{" "}
                      {o.paymentMethod === "CHECK" ? "چک" : "نقدی"}
                    </div>
                  </div>
                  <div className="text-sm font-black tabular-nums">{money(o.subtotal)} ت</div>
                </button>
                {open ? (
                  <div className="border-t border-[var(--border)] bg-[var(--surface-2)]/50">
                    <table className="w-full text-sm">
                      <thead className="text-[var(--muted)]">
                        <tr>
                          <th className="px-4 py-2 text-right font-semibold">کالا</th>
                          <th className="px-4 py-2 text-right font-semibold">تعداد</th>
                          <th className="px-4 py-2 text-right font-semibold">فی</th>
                          <th className="px-4 py-2 text-right font-semibold">جمع</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {o.items.map((i) => (
                          <tr key={i.id}>
                            <td className="px-4 py-2">
                              <div className="font-bold">{i.productTitle}</div>
                              <div className="text-xs text-[var(--muted)]">{i.productSku || "—"}</div>
                            </td>
                            <td className="px-4 py-2 tabular-nums">{money(i.quantity)}</td>
                            <td className="px-4 py-2 tabular-nums">{money(i.unitCost)}</td>
                            <td className="px-4 py-2 font-black tabular-nums">{money(i.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
