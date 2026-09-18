"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpLeft, Plus, FileText, ShoppingCart, Package, WalletCards,
  TrendingUp, AlertTriangle, Truck, ArrowDownLeft
} from "lucide-react";
import Stat from "@/components/dashboard/Stat";
import type { Purchase, Sale } from "@/lib/types";

type Summary = {
  totalRevenue: number;
  totalProfit: number;
  salesCount: number;
  salesTrend: { date: string; amount: number }[];
  lowStock: { title: string; stock: number; sku: string }[];
};

const statusLabel: Record<string, string> = {
  PAID: "پرداخت شد",
  PENDING_TRANSFER: "در انتظار تأیید",
  PARTIAL: "پرداخت جزئی",
  CANCELED: "لغو شده"
};

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/reports/summary", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/admin/sales", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/admin/purchases", { cache: "no-store" }).then((r) => r.json())
    ]).then(([summaryResult, salesResult, purchaseResult]) => {
      if (summaryResult.success) setSummary(summaryResult.data);
      if (salesResult.success) setSales(salesResult.data.slice().reverse().slice(0, 6));
      if (purchaseResult.success) setPurchases(purchaseResult.data.slice().reverse().slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  const todayKey = new Date().toLocaleDateString("fa-IR");
  const todayAmount = summary?.salesTrend.find((item) => item.date === todayKey)?.amount || 0;
  const chartMax = useMemo(() => Math.max(...(summary?.salesTrend.map((item) => item.amount) || [1]), 1), [summary]);

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="relative overflow-hidden rounded-[28px] bg-[var(--primary)] p-6 text-white shadow-xl shadow-[var(--primary)]/15 lg:p-8">
        <div className="absolute -left-16 -top-24 size-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="text-xs font-bold text-white/70">{new Date().toLocaleDateString("fa-IR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
            <h1 className="mt-2 text-3xl font-black tracking-tight">مرکز کنترل فروشگاه</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">فروش، خرید، موجودی و وضعیت مالی فروشگاه را از یک نقطه مدیریت کنید.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/pos" className="btn bg-white text-[var(--primary)]"><Plus size={17} />فروش جدید</Link>
            <Link href="/dashboard/purchases" className="btn border border-white/20 bg-white/10 text-white hover:bg-white/15"><Truck size={17} />ثبت خرید</Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="mt-5 card p-10 text-center text-sm text-[var(--muted)]">در حال آماده‌سازی داشبورد...</div>
      ) : (
        <>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat title="فروش امروز" value={`${todayAmount.toLocaleString("fa-IR")} ت`} sub="مبلغ فروش ثبت‌شده امروز" trend="" />
            <Stat title="درآمد کل" value={`${(summary?.totalRevenue || 0).toLocaleString("fa-IR")} ت`} sub="مجموع فروش‌های ثبت‌شده" trend="" />
            <Stat title="سود ناخالص" value={`${(summary?.totalProfit || 0).toLocaleString("fa-IR")} ت`} sub="جمع سود فروش‌ها" trend="" />
            <Stat title="تعداد فاکتور" value={String(summary?.salesCount || 0)} sub="مجموع فروش‌های ثبت‌شده" trend="" />
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
            <section className="card p-5 lg:p-6">
              <div className="flex items-center justify-between">
                <div><h2 className="font-black">روند فروش</h2><p className="mt-1 text-xs text-[var(--muted)]">۱۴ روز اخیر</p></div>
                <Link href="/dashboard/reports" className="btn btn-secondary !px-3 !py-2 text-xs">گزارش کامل <ArrowUpLeft size={14} /></Link>
              </div>
              <div className="mt-7 flex h-64 items-end gap-1.5">
                {summary?.salesTrend.length ? summary.salesTrend.map((item) => (
                  <div key={item.date} className="group flex h-full flex-1 flex-col justify-end">
                    <div className="relative flex h-full items-end">
                      <div className="absolute bottom-0 left-1/2 hidden -translate-x-1/2 -translate-y-2 whitespace-nowrap rounded-lg bg-[var(--text)] px-2 py-1 text-[9px] text-[var(--surface)] group-hover:block">{item.amount.toLocaleString("fa-IR")} ت</div>
                      <div className="w-full rounded-t-xl bg-[var(--primary)]/75 transition-all group-hover:bg-[var(--primary)]" style={{ height: `${Math.max(4, (item.amount / chartMax) * 100)}%` }} />
                    </div>
                  </div>
                )) : <div className="grid w-full place-items-center text-sm text-[var(--muted)]">هنوز فروشی ثبت نشده است.</div>}
              </div>
            </section>

            <section className="card p-5 lg:p-6">
              <div className="flex items-center justify-between"><div><h2 className="font-black">عملیات سریع</h2><p className="mt-1 text-xs text-[var(--muted)]">دسترسی مستقیم به کارهای پرتکرار</p></div><TrendingUp size={18} className="text-[var(--primary)]" /></div>
              <div className="mt-5 grid gap-2.5">
                {[
                  { title: "ثبت فروش جدید", desc: "صدور فاکتور و کاهش موجودی", href: "/dashboard/pos", icon: ShoppingCart },
                  { title: "ثبت خرید", desc: "افزایش موجودی از تأمین‌کننده", href: "/dashboard/purchases", icon: Package },
                  { title: "مدیریت محصولات", desc: "قیمت، موجودی و دسته‌بندی", href: "/dashboard/products", icon: FileText },
                  { title: "گزارش‌های مالی", desc: "بررسی درآمد و سود", href: "/dashboard/finance", icon: WalletCards }
                ].map((item) => {
                  const Icon = item.icon;
                  return <Link key={item.href} href={item.href} className="group flex items-center gap-3 rounded-2xl border border-[var(--border)] p-3 hover:border-[var(--primary)] hover:bg-[var(--surface-2)]">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]"><Icon size={18} /></span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-black">{item.title}</span><span className="mt-1 block text-[10px] text-[var(--muted)]">{item.desc}</span></span>
                    <ArrowDownLeft size={16} className="text-[var(--muted)] transition group-hover:-translate-x-1" />
                  </Link>;
                })}
              </div>
            </section>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <section className="card overflow-hidden">
              <div className="flex items-center justify-between p-5"><div><h2 className="font-black">فروش‌های اخیر</h2><p className="mt-1 text-xs text-[var(--muted)]">آخرین فاکتورهای ثبت‌شده</p></div><Link href="/dashboard/sales" className="text-xs font-black text-[var(--primary)]">مشاهده همه</Link></div>
              {sales.length ? (
                <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-right text-sm"><thead className="border-y border-[var(--border)] bg-[var(--surface-2)] text-[11px] text-[var(--muted)]"><tr><th className="p-4">خریدار</th><th className="p-4">مبلغ</th><th className="p-4">وضعیت</th></tr></thead><tbody>{sales.map((sale) => <tr key={sale.id} className="border-b border-[var(--border)] last:border-0"><td className="p-4 font-bold">{sale.buyerName || "فروش حضوری"}</td><td className="p-4 font-black">{sale.netAmount.toLocaleString("fa-IR")} ت</td><td className="p-4"><span className="badge bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{statusLabel[sale.paymentStatus] || sale.paymentStatus}</span></td></tr>)}</tbody></table></div>
              ) : <div className="p-10 text-center text-sm text-[var(--muted)]">هنوز فروشی ثبت نشده است.</div>}
            </section>

            <section className="card overflow-hidden">
              <div className="flex items-center justify-between p-5"><div><h2 className="font-black">خریدهای اخیر</h2><p className="mt-1 text-xs text-[var(--muted)]">آخرین ورود کالا به انبار</p></div><Link href="/dashboard/purchases" className="text-xs font-black text-[var(--primary)]">مشاهده همه</Link></div>
              {purchases.length ? (
                <div className="divide-y divide-[var(--border)]">{purchases.map((purchase) => <div key={purchase.id} className="flex items-center justify-between gap-4 p-4"><div><div className="text-sm font-black">{purchase.supplierName || "بدون تأمین‌کننده"}</div><div className="mt-1 text-[10px] text-[var(--muted)]">{new Date(purchase.createdAt).toLocaleString("fa-IR")}</div></div><div className="text-sm font-black">{Number(purchase.subtotal || 0).toLocaleString("fa-IR")} ت</div></div>)}</div>
              ) : <div className="p-10 text-center text-sm text-[var(--muted)]">هنوز خریدی ثبت نشده است.</div>}
            </section>
          </div>

          <section className="card mt-5 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-[var(--border)] p-5"><AlertTriangle size={18} className="text-[var(--warning)]" /><div><h2 className="font-black">هشدار موجودی</h2><p className="mt-1 text-xs text-[var(--muted)]">محصولاتی که نیاز به بررسی دارند</p></div></div>
            {summary?.lowStock.length ? <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">{summary.lowStock.map((item) => <Link href="/dashboard/products" key={item.sku} className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4"><div><div className="font-black">{item.title}</div><div className="mt-1 text-[10px] text-[var(--muted)]">{item.sku}</div></div><b className="text-[var(--danger)]">{item.stock} عدد</b></Link>)}</div> : <div className="p-7 text-center text-sm text-[var(--muted)]">موردی برای هشدار وجود ندارد.</div>}
          </section>
        </>
      )}
    </div>
  );
}
