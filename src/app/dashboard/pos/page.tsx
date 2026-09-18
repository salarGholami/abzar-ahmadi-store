"use client";
import { useEffect, useState } from "react";
import { Search, ScanBarcode, UserRound, Trash2, CreditCard, Printer, Minus, Plus } from "lucide-react";
import type { Product } from "@/lib/types";

type CartLine = Product & { q: number };

export default function POS() {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function loadProducts() {
    setLoading(true);
    try {
      const r = await fetch("/api/products", { cache: "no-store" });
      const j = await r.json();
      setProducts(Array.isArray(j) ? j : []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { loadProducts(); }, []);

  const filtered = products.filter((p) => (p.title + p.sku + p.brand).toLowerCase().includes(query.toLowerCase()));

  function add(p: Product) {
    if (p.stock <= 0) return;
    setCart((c) => {
      const x = c.find((i) => i.id === p.id);
      if (x) {
        if (x.q >= p.stock) return c;
        return c.map((i) => (i.id === p.id ? { ...i, q: i.q + 1 } : i));
      }
      return [...c, { ...p, q: 1 }];
    });
  }

  const total = cart.reduce((s, p) => s + Math.round(p.price * (1 - p.discount / 100)) * p.q, 0);

  async function checkout() {
    if (!cart.length) { alert("سبد خالی است"); return; }
    setSubmitting(true);
    try {
      const r = await fetch("/api/sales/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saleId: crypto.randomUUID(),
          items: cart.map((p) => ({ productId: p.id, quantity: p.q })),
          paymentStatus: "PAID",
          channel: "POS"
        })
      });
      const j = await r.json();
      if (!r.ok || !j.success) { alert(j.error?.message || "خطا در ثبت فروش"); return; }
      alert("فروش با موفقیت ثبت شد");
      setCart([]);
      setQuery("");
      loadProducts();
    } catch {
      alert("خطا در ارتباط با سرور");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-[var(--primary)]">فروش سریع</div>
          <h1 className="mt-1 text-3xl font-black">صندوق فروش / POS</h1>
        </div>
        <div className="text-xs text-[var(--muted)]">F2 جستجو · F4 مشتری · F8 پرداخت · F9 چاپ</div>
      </div>
      <div className="grid min-h-[680px] gap-5 xl:grid-cols-[1fr_460px]">
        <section className="card flex flex-col p-5">
          <div className="relative">
            <Search className="absolute right-3 top-3.5 text-[var(--muted)]" size={19} />
            <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} className="input pr-10 pl-28 py-3" placeholder="نام، SKU یا بارکد را وارد کنید..." />
            <button className="absolute left-2 top-2 btn btn-secondary !p-2" type="button"><ScanBarcode size={18} /></button>
          </div>
          {loading ? (
            <div className="mt-10 text-center text-sm text-[var(--muted)]">در حال دریافت محصولات...</div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <button key={p.id} type="button" disabled={p.stock <= 0} onClick={() => add(p)} className="rounded-2xl border border-[var(--border)] p-4 text-right hover:border-[var(--primary)] hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-50">
                  <div className="text-xs text-[var(--muted)]">{p.brand} · {p.sku}</div>
                  <div className="mt-2 font-black">{p.title}</div>
                  <div className="mt-4 text-sm font-bold">{Math.round(p.price * (1 - p.discount / 100)).toLocaleString("fa-IR")} تومان</div>
                  <div className="mt-2 text-xs text-[var(--success)]">موجودی: {p.stock}</div>
                </button>
              ))}
              {!filtered.length && <div className="col-span-full py-10 text-center text-sm text-[var(--muted)]">محصولی یافت نشد</div>}
            </div>
          )}
        </section>
        <section className="card flex flex-col p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-black">سبد فروش</h2>
            <span className="badge bg-blue-50 text-blue-700 dark:bg-blue-950/40">{cart.length} قلم</span>
          </div>
          <button type="button" className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-[var(--border)] p-3 text-sm font-bold text-[var(--muted)]"><UserRound size={17} />انتخاب مشتری</button>
          <div className="mt-4 flex-1 space-y-2 overflow-auto">
            {cart.length === 0 ? (
              <div className="grid h-full place-items-center text-center text-sm text-[var(--muted)]">هنوز محصولی اضافه نشده<br />از سمت راست محصولات را انتخاب کنید</div>
            ) : cart.map((p) => (
              <div key={p.id} className="rounded-xl bg-[var(--surface-2)] p-3">
                <div className="font-bold">{p.title}</div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setCart((c) => c.map((i) => (i.id === p.id ? { ...i, q: Math.max(1, i.q - 1) } : i)))} className="grid size-7 place-items-center rounded-lg border border-[var(--border)]"><Minus size={13} /></button>
                    <b className="w-7 text-center">{p.q}</b>
                    <button type="button" onClick={() => setCart((c) => c.map((i) => (i.id === p.id ? { ...i, q: Math.min(p.stock, i.q + 1) } : i)))} className="grid size-7 place-items-center rounded-lg border border-[var(--border)]"><Plus size={13} /></button>
                  </div>
                  <div className="flex items-center gap-3">
                    <b>{(Math.round(p.price * (1 - p.discount / 100)) * p.q).toLocaleString("fa-IR")} تومان</b>
                    <button type="button" onClick={() => setCart((c) => c.filter((i) => i.id !== p.id))} className="text-red-500"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-[var(--border)] pt-4">
            <div className="flex justify-between text-sm"><span>جمع</span><b>{total.toLocaleString("fa-IR")} تومان</b></div>
            <div className="mt-2 flex justify-between text-xl font-black"><span>قابل پرداخت</span><span>{total.toLocaleString("fa-IR")} تومان</span></div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" className="btn btn-secondary"><Printer size={17} />پیش‌نمایش</button>
              <button type="button" disabled={submitting} onClick={checkout} className="btn btn-primary disabled:opacity-60"><CreditCard size={17} />{submitting ? "در حال ثبت..." : "پرداخت و ثبت"}</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
