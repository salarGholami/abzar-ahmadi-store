"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, RefreshCw, Search, PackageCheck, X, ChevronDown } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type { Product, Supplier, Purchase } from "@/lib/types";

type Line = { productId: string; title: string; sku: string; image: string; quantity: number; unitCost: number };
type ProductPickerProps = { products: Product[]; selectedId: string; onSelect: (id: string) => void };

function ProductPicker({ products, selectedId, onSelect }: ProductPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => !q || `${p.title} ${p.brand} ${p.sku} ${p.category}`.toLowerCase().includes(q)).slice(0, 12);
  }, [products, query]);

  const selected = products.find((p) => p.id === selectedId);

  return (
    <div className="relative flex-1">
      <button type="button" onClick={() => setOpen((value) => !value)} className="input flex min-h-[48px] items-center gap-3 text-right">
        {selected ? (
          <>
            <div className="size-9 shrink-0 overflow-hidden rounded-lg bg-[var(--surface-2)]">{selected.image && <img src={selected.image} alt="" className="size-full object-cover" />}</div>
            <div className="min-w-0 flex-1"><div className="truncate text-sm font-black">{selected.title}</div><div className="mt-0.5 text-[10px] text-[var(--muted)]">{selected.sku} · {selected.category}</div></div>
          </>
        ) : <span className="flex-1 text-sm text-[var(--muted)]">محصول را جستجو و انتخاب کنید...</span>}
        <ChevronDown size={17} className="shrink-0 text-[var(--muted)]" />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
          <div className="border-b border-[var(--border)] p-3">
            <div className="relative"><Search className="absolute right-3 top-3 text-[var(--muted)]" size={16} /><input autoFocus className="input pr-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="نام محصول، برند یا SKU..." /></div>
          </div>
          <div className="max-h-72 overflow-auto p-2">
            {filtered.map((product) => (
              <button key={product.id} type="button" onClick={() => { onSelect(product.id); setOpen(false); setQuery(""); }} className="flex w-full items-center gap-3 rounded-xl p-2.5 text-right hover:bg-[var(--surface-2)]">
                <div className="size-11 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-2)]">{product.image && <img src={product.image} alt="" className="size-full object-cover" />}</div>
                <div className="min-w-0 flex-1"><div className="truncate text-sm font-black">{product.title}</div><div className="mt-1 text-[10px] text-[var(--muted)]">{product.brand || "بدون برند"} · {product.sku}</div></div>
                <span className="text-[10px] font-bold text-[var(--muted)]">{product.stock} موجود</span>
              </button>
            ))}
            {!filtered.length && <div className="p-6 text-center text-xs text-[var(--muted)]">محصولی پیدا نشد.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

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

  function supplierName(id?: string | null) {
    return suppliers.find((s) => s.id === id)?.name || "-";
  }

  function openModal() {
    setSupplierId("");
    setLines([]);
    setPickProduct("");
    setPaymentMethod("CASH");
    setCheckNumber("");
    setCheckBank("");
    setCheckDue("");
    setError(null);
    setModalOpen(true);
  }

  function addLine() {
    const product = products.find((item) => item.id === pickProduct);
    if (!product) return;
    if (lines.some((line) => line.productId === product.id)) {
      setError("این محصول قبلاً به خرید اضافه شده است.");
      return;
    }
    setLines((previous) => [...previous, {
      productId: product.id,
      title: product.title,
      sku: product.sku,
      image: product.image,
      quantity: 1,
      unitCost: product.purchaseCost || 0
    }]);
    setPickProduct("");
    setError(null);
  }

  const total = lines.reduce((sum, line) => sum + line.quantity * line.unitCost, 0);

  async function submit() {
    if (!lines.length) { setError("حداقل یک محصول انتخاب کنید."); return; }
    if (paymentMethod === "CHECK" && (!checkNumber || !checkBank || !checkDue)) {
      setError("اطلاعات چک را کامل کنید.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/purchases/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: supplierId || null,
          supplierName: supplierName(supplierId) !== "-" ? supplierName(supplierId) : "",
          items: lines.map((line) => ({ productId: line.productId, quantity: line.quantity, unitCost: line.unitCost })),
          paymentMethod,
          check: paymentMethod === "CHECK" ? { number: checkNumber, bank: checkBank, dueDate: checkDue } : undefined
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        setError(result.error?.message || "خطا در ثبت خرید");
        return;
      }

      setModalOpen(false);
      load();
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-black text-[var(--primary)]">خرید و تأمین کالا</div>
          <h1 className="mt-1 text-3xl font-black tracking-tight">خرید از تأمین‌کننده</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">ثبت خرید مستقیماً موجودی محصول را به‌روزرسانی می‌کند.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={load} className="btn btn-secondary"><RefreshCw size={17} />بروزرسانی</button>
          <button type="button" onClick={openModal} className="btn btn-primary"><Plus size={17} />ثبت خرید جدید</button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-5"><div className="text-xs font-bold text-[var(--muted)]">تعداد خریدها</div><div className="mt-2 text-2xl font-black">{rows.length}</div></div>
        <div className="card p-5"><div className="text-xs font-bold text-[var(--muted)]">ارزش خریدها</div><div className="mt-2 text-2xl font-black">{rows.reduce((sum, row) => sum + Number(row.subtotal || 0), 0).toLocaleString("fa-IR")} <span className="text-xs">تومان</span></div></div>
        <div className="card p-5"><div className="text-xs font-bold text-[var(--muted)]">تأمین‌کنندگان فعال</div><div className="mt-2 text-2xl font-black">{suppliers.length}</div></div>
      </div>

      <div className="card mt-5 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-[var(--muted)]">در حال دریافت اطلاعات...</div>
        ) : !rows.length ? (
          <div className="p-14 text-center">
            <PackageCheck className="mx-auto text-[var(--muted)]" size={34} />
            <div className="mt-3 font-black">هنوز خریدی ثبت نشده است</div>
            <p className="mt-1 text-sm text-[var(--muted)]">با ثبت اولین خرید، سابقه تأمین کالا اینجا نمایش داده می‌شود.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-right text-sm">
              <thead className="bg-[var(--surface-2)] text-xs text-[var(--muted)]"><tr><th className="p-4">تأمین‌کننده</th><th className="p-4">مبلغ</th><th className="p-4">پرداخت</th><th className="p-4">تاریخ</th></tr></thead>
              <tbody>{rows.map((row) => (
                <tr key={row.id} className="border-t border-[var(--border)] hover:bg-[var(--surface-2)]">
                  <td className="p-4 font-black">{row.supplierName || supplierName(row.supplierId)}</td>
                  <td className="p-4 font-black">{Number(row.subtotal || 0).toLocaleString("fa-IR")} تومان</td>
                  <td className="p-4"><span className="badge bg-[var(--primary)]/10 text-[var(--primary)]">{row.paymentMethod === "CHECK" ? "چکی" : "نقدی"}</span></td>
                  <td className="p-4 text-[var(--muted)]">{new Date(row.createdAt).toLocaleString("fa-IR")}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal title="ثبت خرید جدید" onClose={() => setModalOpen(false)}>
          <div className="space-y-4">
            {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</div>}

            <div>
              <label className="field-label">تأمین‌کننده</label>
              <select className="input" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                <option value="">بدون تأمین‌کننده مشخص</option>
                {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
              </select>
            </div>

            <div>
              <label className="field-label">افزودن محصول</label>
              <div className="flex gap-2">
                <ProductPicker products={products} selectedId={pickProduct} onSelect={setPickProduct} />
                <button type="button" onClick={addLine} className="btn btn-secondary shrink-0">افزودن</button>
              </div>
            </div>

            {lines.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
                <div className="border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-xs font-black">اقلام خرید · {lines.length} محصول</div>
                <div className="divide-y divide-[var(--border)]">
                  {lines.map((line, index) => (
                    <div key={line.productId} className="flex items-center gap-3 p-3">
                      <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-2)]">{line.image && <img src={line.image} alt="" className="size-full object-cover" />}</div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-black">{line.title}</div>
                        <div className="mt-1 text-[10px] text-[var(--muted)]">{line.sku}</div>
                      </div>
                      <input aria-label={`تعداد ${line.title}`} type="number" min={1} className="input w-20 !py-2" value={line.quantity} onChange={(e) => setLines((previous) => previous.map((item, i) => i === index ? { ...item, quantity: Math.max(1, Number(e.target.value) || 1) } : item))} />
                      <input aria-label={`قیمت ${line.title}`} type="number" min={0} className="input w-32 !py-2" value={line.unitCost} onChange={(e) => setLines((previous) => previous.map((item, i) => i === index ? { ...item, unitCost: Math.max(0, Number(e.target.value) || 0) } : item))} />
                      <button type="button" onClick={() => setLines((previous) => previous.filter((_, i) => i !== index))} className="text-red-500" aria-label="حذف محصول"><Trash2 size={17} /></button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--surface-2)] px-4 py-4">
                  <span className="text-xs font-bold text-[var(--muted)]">جمع خرید</span>
                  <strong className="text-lg">{total.toLocaleString("fa-IR")} تومان</strong>
                </div>
              </div>
            )}

            <div>
              <label className="field-label">روش پرداخت</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setPaymentMethod("CASH")} className={`btn ${paymentMethod === "CASH" ? "btn-primary" : "btn-secondary"}`}>نقدی</button>
                <button type="button" onClick={() => setPaymentMethod("CHECK")} className={`btn ${paymentMethod === "CHECK" ? "btn-primary" : "btn-secondary"}`}>چکی</button>
              </div>
            </div>

            {paymentMethod === "CHECK" && (
              <div className="grid gap-2 rounded-2xl border border-[var(--border)] p-3 sm:grid-cols-2">
                <input className="input" placeholder="شماره چک" value={checkNumber} onChange={(e) => setCheckNumber(e.target.value)} />
                <input className="input" placeholder="نام بانک" value={checkBank} onChange={(e) => setCheckBank(e.target.value)} />
                <input className="input sm:col-span-2" type="date" value={checkDue} onChange={(e) => setCheckDue(e.target.value)} />
              </div>
            )}

            <button type="button" disabled={saving} onClick={submit} className="btn btn-primary w-full disabled:opacity-60">{saving ? "در حال ثبت خرید..." : "ثبت خرید و افزایش موجودی"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
