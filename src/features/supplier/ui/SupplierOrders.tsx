"use client";

import { useState } from "react";
import { EmptyState, PageHeader, faDate, money } from "@/features/portal/ui/PortalUI";
import Pagination from "@/shared/ui/Pagination";
import { useSupplierOrders } from "../hooks";

export default function SupplierOrders({ asInvoices = false }: { asInvoices?: boolean }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useSupplierOrders({ page, pageSize: 10 });
  const rows = data?.items ?? [];
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <PageHeader title={asInvoices ? "فاکتورها" : "سفارش‌های خرید"} description={asInvoices ? "اسناد خرید ثبت‌شده توسط مدیر مرتبط با حساب شما." : "خریدهای ثبت‌شده از حساب شما با جزئیات اقلام."} />
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</div> : null}
      {isLoading ? <EmptyState message="در حال بارگذاری..." /> : !rows.length ? <EmptyState message="موردی ثبت نشده است." /> : (
        <div className="space-y-3">
          {rows.map((o) => {
            const open = openId === o.id;
            return (
              <article key={o.id} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                <button type="button" onClick={() => setOpenId(open ? null : o.id)} className="flex w-full items-center justify-between gap-4 p-4 text-right">
                  <div>
                    <div className="font-black">{asInvoices ? "فاکتور" : "سفارش"} #{o.id.slice(0, 8)}</div>
                    <div className="mt-1 text-xs text-[var(--muted)]">{faDate(o.createdAt)} · {money(o.itemCount)} قلم · {o.paymentMethod === "CHECK" ? "چک" : "نقدی"}</div>
                  </div>
                  <div className="text-sm font-black tabular-nums">{money(o.subtotal)} ت</div>
                </button>
                {open ? <div className="border-t border-[var(--border)] bg-[var(--surface-2)]/50"><table className="w-full text-sm"><tbody className="divide-y divide-[var(--border)]">
                  {o.items.map((i) => <tr key={i.id}><td className="px-4 py-2"><div className="font-bold">{i.productTitle}</div><div className="text-xs text-[var(--muted)]">{i.productSku || "—"}</div></td><td className="px-4 py-2">{money(i.quantity)}</td><td className="px-4 py-2">{money(i.unitCost)}</td><td className="px-4 py-2 font-black">{money(i.total)}</td></tr>)}
                </tbody></table></div> : null}
              </article>
            );
          })}
          {data?.pagination ? <Pagination pagination={data.pagination} onPageChange={(next) => { setOpenId(null); setPage(next); }} /> : null}
        </div>
      )}
    </div>
  );
}
