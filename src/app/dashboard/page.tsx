"use client";
import { ArrowLeft, Plus, FileText, ShoppingCart, Package, WalletCards } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Stat from "@/components/dashboard/Stat";
import type { Sale } from "@/lib/types";

type Summary = { totalRevenue: number; totalProfit: number; salesCount: number; salesTrend: { date: string; amount: number }[]; lowStock: { title: string; stock: number; sku: string }[] };

const statusLabel: Record<string, string> = { PAID: "پرداخت شد", PENDING_TRANSFER: "در انتظار تایید", PARTIAL: "پرداخت جزئی", CANCELED: "لغوشده" };

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [sales, setSales] = useState<Sale[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/reports/summary", { cache: "no-store" }).then((r) => r.json()).then((j) => { if (j.success) setSummary(j.data); }).catch(() => {});
    fetch("/api/admin/sales", { cache: "no-store" }).then((r) => r.json()).then((j) => { if (j.success) setSales(j.data.slice().reverse().slice(0, 5)); }).catch(() => {});
  }, []);

  const todayKey = new Date().toLocaleDateString("fa-IR");
  const todayAmount = summary?.salesTrend.find((d) => d.date === todayKey)?.amount || 0;

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-[var(--primary)]">{new Date().toLocaleDateString("fa-IR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
          <h1 className="mt-1 text-3xl font-black">خلاصه فروشگاه</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">نمای کلی عملکرد کسب‌وکار</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/pos" className="btn btn-primary"><Plus size={17} />فروش جدید</Link>
          <Link href="/dashboard/products" className="btn btn-secondary">مدیریت محصولات</Link>
        </div>
      </div>

      {summary && (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat title="فروش امروز" value={`${todayAmount.toLocaleString("fa-IR")} ت`} sub="مبلغ فروش ثبت‌شده امروز" trend="" />
          <Stat title="درآمد کل" value={`${summary.totalRevenue.toLocaleString("fa-IR")} ت`} sub="مجموع فروش‌های ثبت‌شده" trend="" />
          <Stat title="سود ناخالص کل" value={`${summary.totalProfit.toLocaleString("fa-IR")} ت`} sub="جمع سود فروش‌ها" trend="" />
          <Stat title="تعداد فروش" value={String(summary.salesCount)} sub="مجموع فاکتورهای ثبت‌شده" trend="" />
        </div>
      )}

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <section className="card p-5">
          <div className="flex items-center justify-between"><div><h2 className="font-black">روند فروش</h2><p className="mt-1 text-xs text-[var(--muted)]">۱۴ روز اخیر</p></div>
            <Link href="/dashboard/reports" className="btn btn-secondary !px-3 !py-2 text-xs">گزارش کامل</Link>
          </div>
          <div className="mt-8 flex h-64 items-end gap-2">
            {summary?.salesTrend.length ? summary.salesTrend.map((d) => {
              const max = Math.max(...summary.salesTrend.map((x) => x.amount), 1);
              return <div key={d.date} title={`${d.date}: ${d.amount.toLocaleString("fa-IR")}`} className="flex h-full flex-1 flex-col justify-end gap-2">
                <div className="rounded-t-xl bg-[var(--primary)]/80 transition hover:bg-[var(--primary)]" style={{ height: `${Math.max(4, (d.amount / max) * 100)}%` }} />
              </div>;
            }) : <div className="grid w-full place-items-center text-sm text-[var(--muted)]">هنوز فروشی ثبت نشده است</div>}
          </div>
        </section>
        <section className="card p-5">
          <div className="flex items-center justify-between"><h2 className="font-black">دسترسی سریع</h2><ArrowLeft size={17} className="text-[var(--muted)]" /></div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[["فروش جدید", "/dashboard/pos", ShoppingCart], ["ثبت خرید", "/dashboard/purchases", Package], ["فاکتورها", "/dashboard/sales", FileText], ["صندوق", "/dashboard/finance", WalletCards]].map(([t, h, I]: any) => (
              <Link href={String(h)} key={String(t)} className="group rounded-2xl border border-[var(--border)] p-4 hover:border-[var(--primary)] hover:bg-[var(--surface-2)]">
                <I size={19} className="text-[var(--primary)]" />
                <div className="mt-4 text-sm font-black">{String(t)}</div>
                <div className="mt-1 text-xs text-[var(--muted)]">باز کردن ←</div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between p-5"><h2 className="font-black">فروش‌های اخیر</h2><Link href="/dashboard/sales" className="text-xs font-bold text-[var(--primary)]">مشاهده همه</Link></div>
          {sales && sales.length ? (
            <table className="w-full text-right text-sm">
              <thead className="border-y border-[var(--border)] bg-[var(--surface-2)] text-xs text-[var(--muted)]"><tr><th className="p-4">خریدار</th><th className="p-4">مبلغ</th><th className="p-4">وضعیت</th></tr></thead>
              <tbody>{sales.map((s) => (
                <tr key={s.id} className="border-b border-[var(--border)]">
                  <td className="p-4 font-bold">{s.buyerName || "فروش حضوری"}</td>
                  <td className="p-4 font-bold">{s.netAmount.toLocaleString("fa-IR")} ت</td>
                  <td className="p-4"><span className="badge bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300">{statusLabel[s.paymentStatus] || s.paymentStatus}</span></td>
                </tr>
              ))}</tbody>
            </table>
          ) : <div className="p-8 text-center text-sm text-[var(--muted)]">{sales ? "هنوز فروشی ثبت نشده" : "بدون دسترسی نمایش"}</div>}
        </section>
        <section className="card p-5">
          <h2 className="font-black">هشدارهای انبار</h2>
          <div className="mt-4 space-y-3">
            {summary?.lowStock.length ? summary.lowStock.map((r) => (
              <div key={r.sku} className="flex items-center justify-between rounded-xl bg-[var(--surface-2)] p-4">
                <div><div className="font-bold">{r.title}</div><div className="mt-1 text-xs text-[var(--muted)]">موجودی کم</div></div>
                <b className="text-red-500">{r.stock} عدد</b>
              </div>
            )) : <div className="p-4 text-center text-sm text-[var(--muted)]">{summary ? "همه محصولات موجودی کافی دارند" : "بدون دسترسی نمایش"}</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
