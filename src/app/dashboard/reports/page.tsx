"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { RefreshCw, TrendingUp, TrendingDown, Wallet, Boxes } from "lucide-react";

type Summary = {
  totalRevenue: number; totalProfit: number; revenueThisMonth: number; salesCount: number;
  salesTrend: { date: string; amount: number }[];
  topProducts: { title: string; qty: number }[];
  lowStock: { title: string; stock: number; sku: string }[];
  income: number; expense: number; net: number;
};

export default function ReportsPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/reports/summary", { cache: "no-store" });
      const j = await r.json();
      if (!j.success) { setError(j.error?.message); return; }
      setData(j.data);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-[var(--primary)]">تحلیل کسب‌وکار</div>
          <h1 className="mt-1 text-3xl font-black">گزارش‌ها</h1>
        </div>
        <button type="button" onClick={load} className="btn btn-secondary"><RefreshCw size={17} />بروزرسانی</button>
      </div>

      {loading ? (
        <div className="mt-10 text-center text-[var(--muted)]">در حال محاسبه گزارش از داده‌های واقعی...</div>
      ) : error ? (
        <div className="mt-10 rounded-xl bg-red-50 p-4 text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</div>
      ) : data && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card p-5"><div className="flex items-center gap-2 text-xs text-[var(--muted)]"><Wallet size={15} />درآمد کل</div><div className="mt-2 text-xl font-black">{data.totalRevenue.toLocaleString("fa-IR")} تومان</div></div>
            <div className="card p-5"><div className="flex items-center gap-2 text-xs text-[var(--muted)]"><TrendingUp size={15} />سود ناخالص</div><div className="mt-2 text-xl font-black text-[var(--success)]">{data.totalProfit.toLocaleString("fa-IR")} تومان</div></div>
            <div className="card p-5"><div className="flex items-center gap-2 text-xs text-[var(--muted)]"><Boxes size={15} />تعداد فروش</div><div className="mt-2 text-xl font-black">{data.salesCount.toLocaleString("fa-IR")}</div></div>
            <div className="card p-5"><div className="flex items-center gap-2 text-xs text-[var(--muted)]"><TrendingDown size={15} />هزینه‌های ثبت‌شده</div><div className="mt-2 text-xl font-black text-red-500">{data.expense.toLocaleString("fa-IR")} تومان</div></div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            <div className="card p-5">
              <h3 className="font-black">روند فروش</h3>
              <div className="mt-4 h-72">
                {data.salesTrend.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.salesTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => v.toLocaleString("fa-IR") + " تومان"} />
                      <Line type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <div className="grid h-full place-items-center text-sm text-[var(--muted)]">هنوز فروشی ثبت نشده است</div>}
              </div>
            </div>
            <div className="card p-5">
              <h3 className="font-black">پرفروش‌ترین محصولات</h3>
              <div className="mt-4 h-72">
                {data.topProducts.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.topProducts} layout="vertical" margin={{ left: 20 }}>
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="title" width={110} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="qty" fill="var(--primary)" radius={6} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="grid h-full place-items-center text-sm text-[var(--muted)]">داده‌ای موجود نیست</div>}
              </div>
            </div>
          </div>

          <div className="card mt-6 p-5">
            <h3 className="font-black">هشدار موجودی کم</h3>
            {data.lowStock.length ? (
              <div className="mt-3 overflow-auto">
                <table className="w-full text-right text-sm">
                  <thead className="text-xs text-[var(--muted)]"><tr><th className="p-2">محصول</th><th className="p-2">SKU</th><th className="p-2">موجودی</th></tr></thead>
                  <tbody>{data.lowStock.map((p) => (
                    <tr key={p.sku} className="border-t border-[var(--border)]"><td className="p-2 font-bold">{p.title}</td><td className="p-2 text-[var(--muted)]">{p.sku}</td><td className="p-2 font-black text-red-500">{p.stock}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            ) : <div className="mt-3 text-sm text-[var(--muted)]">همه محصولات موجودی کافی دارند</div>}
          </div>
        </>
      )}
    </div>
  );
}
