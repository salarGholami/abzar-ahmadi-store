"use client";

import { useEffect, useMemo, useState } from "react";
import { Database, RefreshCw, Search, FileJson, Users, Boxes } from "lucide-react";

type Row = Record<string, unknown> & { id?: string };
type DataResponse = { collections: Record<string, Row[]>; users: Row[]; generatedAt: string };

const labels: Record<string, string> = {
  products: "محصولات", categories: "دسته‌بندی‌ها", brands: "برندها", customers: "مشتریان", suppliers: "تأمین‌کنندگان",
  sales: "فروش‌ها", "sale-items": "آیتم‌های فروش", purchases: "خریدها", "purchase-items": "آیتم‌های خرید",
  inventory: "موجودی و گردش انبار", finance: "دفتر مالی", expenses: "هزینه‌ها", incomes: "درآمدها", checks: "چک‌ها",
  quotations: "پیش‌فاکتورها", "quotation-items": "آیتم‌های پیش‌فاکتور", "activity-logs": "لاگ فعالیت‌ها", settings: "تنظیمات", users: "کاربران"
};

function display(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function DataTable({ rows }: { rows: Row[] }) {
  const keys = useMemo(() => Array.from(new Set(rows.flatMap((row) => Object.keys(row)))).slice(0, 9), [rows]);
  if (!rows.length) return <div className="p-8 text-center text-sm text-[var(--muted)]">داده‌ای ثبت نشده است.</div>;
  return (
    <div className="overflow-auto">
      <table className="w-full min-w-[900px] text-right text-xs">
        <thead className="bg-[var(--surface-2)] text-[var(--muted)]">
          <tr>{keys.map((key) => <th key={key} className="p-3 font-black">{key}</th>)}</tr>
        </thead>
        <tbody>{rows.slice(0, 100).map((row, index) => (
          <tr key={String(row.id || index)} className="border-t border-[var(--border)] align-top">
            {keys.map((key) => <td key={key} className="max-w-[260px] p-3 break-words">{display(row[key])}</td>)}
          </tr>
        ))}</tbody>
      </table>
      {rows.length > 100 && <div className="border-t border-[var(--border)] p-3 text-center text-[10px] text-[var(--muted)]">نمایش ۱۰۰ رکورد اول از {rows.length.toLocaleString("fa-IR")} رکورد</div>}
    </div>
  );
}

export default function DataCenterPage() {
  const [data, setData] = useState<DataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("products");

  async function load() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/data-center", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error?.message || "دریافت داده‌ها انجام نشد.");
      setData(result.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا در ارتباط با سرور");
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  const entries = useMemo(() => {
    if (!data) return [] as [string, Row[]][];
    return [...Object.entries(data.collections), ["users", data.users] as [string, Row[]]];
  }, [data]);

  const filteredEntries = entries.filter(([key, rows]) => {
    const q = query.trim().toLowerCase();
    return !q || `${labels[key]} ${key}`.toLowerCase().includes(q) || rows.some((row) => Object.values(row).some((value) => display(value).toLowerCase().includes(q)));
  });

  const activeRows = data ? (active === "users" ? data.users : data.collections[active] || []) : [];

  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><div className="text-xs font-black text-[var(--primary)]">مدیریت مرکزی</div><h1 className="mt-1 text-3xl font-black">مرکز تمام داده‌ها</h1><p className="mt-2 text-sm text-[var(--muted)]">تمام داده‌های عملیاتی فروشگاه، بدون دسترسی مستقیم به فایل‌های JSON، از اینجا قابل مشاهده‌اند.</p></div>
        <button type="button" onClick={() => void load()} className="btn btn-secondary"><RefreshCw size={17}/>بروزرسانی</button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-5"><div className="flex items-center gap-2 text-xs font-bold text-[var(--muted)]"><Database size={15}/> مجموعه‌ها</div><div className="mt-2 text-3xl font-black">{entries.length.toLocaleString("fa-IR")}</div></div>
        <div className="card p-5"><div className="flex items-center gap-2 text-xs font-bold text-[var(--muted)]"><Boxes size={15}/> کل رکوردها</div><div className="mt-2 text-3xl font-black">{entries.reduce((sum, [, rows]) => sum + rows.length, 0).toLocaleString("fa-IR")}</div></div>
        <div className="card p-5"><div className="flex items-center gap-2 text-xs font-bold text-[var(--muted)]"><Users size={15}/> کاربران</div><div className="mt-2 text-3xl font-black">{(data?.users.length || 0).toLocaleString("fa-IR")}</div></div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="card h-fit p-3">
          <div className="relative"><Search className="absolute right-3 top-3 text-[var(--muted)]" size={16}/><input className="input pr-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جستجوی داده..."/></div>
          <div className="mt-3 max-h-[65vh] space-y-1 overflow-auto">
            {filteredEntries.map(([key, rows]) => <button type="button" key={key} onClick={() => setActive(key)} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-right text-xs font-bold ${active === key ? "bg-[var(--primary)] text-white" : "hover:bg-[var(--surface-2)]"}`}><span>{labels[key] || key}</span><span className="opacity-70">{rows.length.toLocaleString("fa-IR")}</span></button>)}
          </div>
        </aside>
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] p-5"><div><div className="flex items-center gap-2"><FileJson size={18} className="text-[var(--primary)]"/><h2 className="font-black">{labels[active] || active}</h2></div><p className="mt-1 text-xs text-[var(--muted)]">{activeRows.length.toLocaleString("fa-IR")} رکورد</p></div></div>
          {loading ? <div className="p-12 text-center text-sm text-[var(--muted)]">در حال دریافت تمام داده‌ها...</div> : error ? <div className="p-12 text-center text-sm text-red-600">{error}</div> : <DataTable rows={activeRows}/>} 
        </section>
      </div>
    </div>
  );
}
