"use client";
import { useEffect, useState } from "react";
import { RefreshCw, Eye, Printer } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type { Sale, SaleItem, Product } from "@/lib/types";

const statusLabel: Record<string, string> = { PAID: "پرداخت‌شده", PENDING_TRANSFER: "در انتظار تایید واریز", PARTIAL: "پرداخت جزئی", CANCELED: "لغوشده" };
const statusClass: Record<string, string> = {
  PAID: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300",
  PENDING_TRANSFER: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  PARTIAL: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  CANCELED: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
};

export default function SalesPage() {
  const [rows, setRows] = useState<Sale[]>([]);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Sale | null>(null);
  const [updating, setUpdating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [r1, r2, r3] = await Promise.all([
        fetch("/api/admin/sales", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/sale-items", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/products", { cache: "no-store" }).then((r) => r.json())
      ]);
      setRows(r1.success ? r1.data.slice().reverse() : []);
      setItems(r2.success ? r2.data : []);
      setProducts(r3.success ? r3.data : []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  function productName(id: string) { return products.find((p) => p.id === id)?.title || id; }

  async function setStatus(sale: Sale, status: string) {
    setUpdating(true);
    try {
      const r = await fetch(`/api/admin/sales/${sale.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentStatus: status }) });
      const j = await r.json();
      if (!r.ok || !j.success) { alert(j.error?.message || "خطا در بروزرسانی"); return; }
      setSelected(j.data);
      load();
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-[var(--primary)]">مدیریت فروشگاه</div>
          <h1 className="mt-1 text-3xl font-black">فروش‌ها</h1>
        </div>
        <button type="button" onClick={load} className="btn btn-secondary"><RefreshCw size={17} />بروزرسانی</button>
      </div>

      <div className="card mt-6 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-[var(--muted)]">در حال دریافت از GitHub...</div>
        ) : !rows.length ? (
          <div className="p-10 text-center text-[var(--muted)]">هنوز فروشی ثبت نشده</div>
        ) : (
          <table className="w-full text-right text-sm">
            <thead className="bg-[var(--surface-2)] text-xs text-[var(--muted)]"><tr><th className="p-4">خریدار</th><th className="p-4">مبلغ</th><th className="p-4">کانال</th><th className="p-4">وضعیت</th><th className="p-4">تاریخ</th><th className="p-4">عملیات</th></tr></thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-t border-[var(--border)]">
                  <td className="p-4 font-bold">{s.buyerName || "فروش حضوری"}</td>
                  <td className="p-4 font-black">{Number(s.netAmount || 0).toLocaleString("fa-IR")} تومان</td>
                  <td className="p-4 text-[var(--muted)]">{s.channel === "ONLINE" ? "آنلاین" : "حضوری/POS"}</td>
                  <td className="p-4"><span className={`badge ${statusClass[s.paymentStatus] || ""}`}>{statusLabel[s.paymentStatus] || s.paymentStatus}</span></td>
                  <td className="p-4 text-[var(--muted)]">{new Date(s.createdAt).toLocaleString("fa-IR")}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setSelected(s)} className="btn btn-secondary !p-2"><Eye size={15} /></button>
                      <a href={`/dashboard/sales/${s.id}/print`} target="_blank" rel="noreferrer" className="btn btn-secondary !p-2"><Printer size={15} /></a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <Modal title="جزئیات فروش" onClose={() => setSelected(null)}>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-[var(--muted)]">خریدار</span><b>{selected.buyerName || "فروش حضوری"}</b></div>
            {selected.buyerPhone && <div className="flex justify-between"><span className="text-[var(--muted)]">موبایل</span><b>{selected.buyerPhone}</b></div>}
            <div className="rounded-xl border border-[var(--border)] divide-y divide-[var(--border)]">
              {items.filter((i) => i.saleId === selected.id).map((i) => (
                <div key={i.id} className="flex justify-between p-3"><span>{productName(i.productId)} × {i.quantity}</span><b>{i.total.toLocaleString("fa-IR")} تومان</b></div>
              ))}
            </div>
            <div className="flex justify-between text-base font-black"><span>مبلغ نهایی</span><span>{selected.netAmount.toLocaleString("fa-IR")} تومان</span></div>
            {selected.receiptImage && (
              <div>
                <div className="mb-1 text-xs text-[var(--muted)]">رسید پرداخت مشتری</div>
                <img src={selected.receiptImage} alt="رسید" className="max-h-64 w-full rounded-xl border border-[var(--border)] object-contain" />
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs font-bold text-[var(--muted)]">وضعیت پرداخت</label>
              <select disabled={updating} className="input" value={selected.paymentStatus} onChange={(e) => setStatus(selected, e.target.value)}>
                {Object.entries(statusLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <a href={`/dashboard/sales/${selected.id}/print`} target="_blank" rel="noreferrer" className="btn btn-primary w-full"><Printer size={16} />چاپ فاکتور</a>
          </div>
        </Modal>
      )}
    </div>
  );
}
