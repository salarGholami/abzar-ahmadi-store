"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type { Product, Supplier, Purchase } from "@/lib/types";

type Line = { productId: string; title: string; quantity: number; unitCost: number };

export default function PurchasesPage() {
  const [rows, setRows] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [supplierId, setSupplierId] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [pickProduct, setPickProduct] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CHECK">("CASH");
  const [checkNumber, setCheckNumber] = useState("");
  const [checkBank, setCheckBank] = useState("");
  const [checkDue, setCheckDue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [r1, r2, r3] = await Promise.all([
        fetch("/api/admin/purchases", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/products", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/suppliers", { cache: "no-store" }).then((r) => r.json())
      ]);
      setRows(r1.success ? r1.data.slice().reverse() : []);
      setProducts(r2.success ? r2.data : []);
      setSuppliers(r3.success ? r3.data : []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  function supplierName(id?: string | null) { return suppliers.find((s) => s.id === id)?.name || "-"; }

  function openModal() {
    setSupplierId(""); setLines([]); setPickProduct(""); setPaymentMethod("CASH");
    setCheckNumber(""); setCheckBank(""); setCheckDue(""); setError(null); setModalOpen(true);
  }

  function addLine() {
    const p = products.find((x) => x.id === pickProduct);
    if (!p) return;
    if (lines.some((l) => l.productId === p.id)) return;
    setLines((prev) => [...prev, { productId: p.id, title: p.title, quantity: 1, unitCost: p.purchaseCost || 0 }]);
    setPickProduct("");
  }

  const total = lines.reduce((s, l) => s + l.quantity * l.unitCost, 0);

  async function submit() {
    if (!lines.length) { setError("حداقل یک قلم کالا اضافه کنید"); return; }
    setSaving(true); setError(null);
    try {
      const r = await fetch("/api/purchases/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: supplierId || null,
          supplierName: supplierName(supplierId) !== "-" ? supplierName(supplierId) : "",
          items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity, unitCost: l.unitCost })),
          paymentMethod,
          check: paymentMethod === "CHECK" ? { number: checkNumber, bank: checkBank, dueDate: checkDue } : undefined
        })
      });
      const j = await r.json();
      if (!r.ok || !j.success) { setError(j.error?.message || "خطا در ثبت خرید"); return; }
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
          <h1 className="mt-1 text-3xl font-black">خریدها</h1>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={load} className="btn btn-secondary"><RefreshCw size={17} />بروزرسانی</button>
          <button type="button" onClick={openModal} className="btn btn-primary"><Plus size={17} />ثبت خرید جدید</button>
        </div>
      </div>

      <div className="card mt-6 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-[var(--muted)]">در حال دریافت از GitHub...</div>
        ) : !rows.length ? (
          <div className="p-10 text-center text-[var(--muted)]">هنوز خریدی ثبت نشده</div>
        ) : (
          <table className="w-full text-right text-sm">
            <thead className="bg-[var(--surface-2)] text-xs text-[var(--muted)]"><tr><th className="p-4">تأمین‌کننده</th><th className="p-4">مبلغ</th><th className="p-4">پرداخت</th><th className="p-4">تاریخ</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-[var(--border)]">
                  <td className="p-4 font-bold">{r.supplierName || supplierName(r.supplierId)}</td>
                  <td className="p-4 font-black">{Number(r.subtotal || 0).toLocaleString("fa-IR")} تومان</td>
                  <td className="p-4">{r.paymentMethod === "CHECK" ? "چکی" : "نقدی"}</td>
                  <td className="p-4 text-[var(--muted)]">{new Date(r.createdAt).toLocaleString("fa-IR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <Modal title="ثبت خرید جدید" onClose={() => setModalOpen(false)}>
          <div className="space-y-3">
            {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</div>}
            <div>
              <label className="mb-1 block text-xs font-bold text-[var(--muted)]">تأمین‌کننده</label>
              <select className="input" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                <option value="">بدون تأمین‌کننده مشخص</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <select className="input" value={pickProduct} onChange={(e) => setPickProduct(e.target.value)}>
                <option value="">انتخاب محصول...</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
              <button type="button" onClick={addLine} className="btn btn-secondary shrink-0">افزودن</button>
            </div>
            {lines.length > 0 && (
              <div className="space-y-2 rounded-xl border border-[var(--border)] p-3">
                {lines.map((l, idx) => (
                  <div key={l.productId} className="flex items-center gap-2 text-sm">
                    <span className="flex-1 truncate font-bold">{l.title}</span>
                    <input type="number" min={1} className="input w-20 !py-1.5" value={l.quantity} onChange={(e) => setLines((prev) => prev.map((x, i) => (i === idx ? { ...x, quantity: Number(e.target.value) || 1 } : x)))} />
                    <input type="number" min={0} className="input w-28 !py-1.5" value={l.unitCost} onChange={(e) => setLines((prev) => prev.map((x, i) => (i === idx ? { ...x, unitCost: Number(e.target.value) || 0 } : x)))} placeholder="قیمت واحد" />
                    <button type="button" onClick={() => setLines((prev) => prev.filter((_, i) => i !== idx))} className="text-red-500"><Trash2 size={16} /></button>
                  </div>
                ))}
                <div className="border-t border-[var(--border)] pt-2 text-left text-sm font-black">جمع: {total.toLocaleString("fa-IR")} تومان</div>
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs font-bold text-[var(--muted)]">روش پرداخت</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPaymentMethod("CASH")} className={`btn flex-1 ${paymentMethod === "CASH" ? "btn-primary" : "btn-secondary"}`}>نقدی</button>
                <button type="button" onClick={() => setPaymentMethod("CHECK")} className={`btn flex-1 ${paymentMethod === "CHECK" ? "btn-primary" : "btn-secondary"}`}>چکی</button>
              </div>
            </div>
            {paymentMethod === "CHECK" && (
              <div className="space-y-2 rounded-xl border border-[var(--border)] p-3">
                <input className="input" placeholder="شماره چک" value={checkNumber} onChange={(e) => setCheckNumber(e.target.value)} />
                <input className="input" placeholder="نام بانک" value={checkBank} onChange={(e) => setCheckBank(e.target.value)} />
                <input className="input" type="date" value={checkDue} onChange={(e) => setCheckDue(e.target.value)} />
              </div>
            )}
            <button type="button" disabled={saving} onClick={submit} className="btn btn-primary w-full disabled:opacity-60">{saving ? "در حال ثبت..." : "ثبت خرید"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
