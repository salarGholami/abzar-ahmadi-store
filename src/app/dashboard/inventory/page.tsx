"use client";
import { useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type { Product, InventoryMovement } from "@/lib/types";

export default function InventoryPage() {
  const [rows, setRows] = useState<InventoryMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch("/api/admin/inventory", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/products", { cache: "no-store" }).then((r) => r.json())
      ]);
      setRows(r1.success ? r1.data.slice().reverse() : []);
      setProducts(r2.success ? r2.data : []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  function productName(id: string) { return products.find((p) => p.id === id)?.title || id; }

  function openModal() {
    setProductId(""); setQuantity(""); setReason(""); setError(null); setModalOpen(true);
  }

  async function submit() {
    const q = Number(quantity);
    if (!productId || !Number.isFinite(q) || q === 0) { setError("محصول و مقدار تعدیل (غیر صفر) الزامی است"); return; }
    setSaving(true); setError(null);
    try {
      const r = await fetch("/api/inventory/adjust", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: q, reason })
      });
      const j = await r.json();
      if (!r.ok || !j.success) { setError(j.error?.message || "خطا در ثبت تعدیل"); return; }
      setModalOpen(false);
      load();
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-[var(--primary)]">مدیریت فروشگاه</div>
          <h1 className="mt-1 text-3xl font-black">انبار</h1>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={load} className="btn btn-secondary"><RefreshCw size={17} />بروزرسانی</button>
          <button type="button" onClick={openModal} className="btn btn-primary"><Plus size={17} />تعدیل موجودی</button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice().sort((a, b) => a.stock - b.stock).slice(0, 4).map((p) => (
          <div key={p.id} className="card p-4">
            <div className="text-xs text-[var(--muted)]">{p.sku}</div>
            <div className="mt-1 font-bold">{p.title}</div>
            <div className={`mt-2 text-lg font-black ${p.stock <= 5 ? "text-red-500" : ""}`}>{p.stock} عدد</div>
          </div>
        ))}
      </div>

      <div className="card mt-6 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-[var(--muted)]">در حال دریافت از GitHub...</div>
        ) : !rows.length ? (
          <div className="p-10 text-center text-[var(--muted)]">هنوز حرکت انباری ثبت نشده</div>
        ) : (
          <table className="w-full text-right text-sm">
            <thead className="bg-[var(--surface-2)] text-xs text-[var(--muted)]"><tr><th className="p-4">محصول</th><th className="p-4">مقدار تغییر</th><th className="p-4">دلیل</th><th className="p-4">تاریخ</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-[var(--border)]">
                  <td className="p-4 font-bold">{productName(r.productId)}</td>
                  <td className={`p-4 font-black ${r.quantity < 0 ? "text-red-500" : "text-green-600"}`}>{r.quantity > 0 ? `+${r.quantity}` : r.quantity}</td>
                  <td className="p-4 text-[var(--muted)]">{r.reason || "-"}</td>
                  <td className="p-4 text-[var(--muted)]">{new Date(r.updatedAt).toLocaleString("fa-IR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <Modal title="تعدیل موجودی" onClose={() => setModalOpen(false)}>
          <div className="space-y-3">
            {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</div>}
            <div>
              <label className="mb-1 block text-xs font-bold text-[var(--muted)]">محصول</label>
              <select className="input" value={productId} onChange={(e) => setProductId(e.target.value)}>
                <option value="">انتخاب کنید</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.title} (موجودی فعلی: {p.stock})</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[var(--muted)]">مقدار تعدیل (مثبت=افزایش، منفی=کاهش)</label>
              <input className="input" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="مثلاً 5 یا -3" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[var(--muted)]">دلیل تعدیل</label>
              <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="مثلاً شمارش فیزیکی، کالای معیوب و..." />
            </div>
            <button type="button" disabled={saving} onClick={submit} className="btn btn-primary w-full disabled:opacity-60">{saving ? "در حال ثبت..." : "ثبت تعدیل"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
