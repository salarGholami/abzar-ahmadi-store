"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Search, Pencil, Trash2, Package, SlidersHorizontal, X } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type { Category, Product } from "@/lib/types";

type Form = {
  title: string;
  brand: string;
  sku: string;
  category: string;
  price: number;
  discount: number;
  purchaseCost: number;
  stock: number;
  image: string;
};

const emptyForm: Form = {
  title: "", brand: "", sku: "", category: "", price: 0, discount: 0, purchaseCost: 0, stock: 0, image: ""
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");
  const [sort, setSort] = useState<"newest" | "price-low" | "price-high" | "stock-low">("newest");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch("/api/admin/products", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/categories", { cache: "no-store" }).then((r) => r.json())
      ]);
      setProducts(productsResponse.success ? productsResponse.data : []);
      setCategories(categoriesResponse.success ? categoriesResponse.data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = products.filter((product) => {
      const matchesQuery = !q || `${product.title} ${product.brand} ${product.sku} ${product.category}`.toLowerCase().includes(q);
      const matchesCategory = !category || product.category === category;
      const matchesStock = stockFilter === "all" || (stockFilter === "out" ? product.stock <= 0 : product.stock > 0 && product.stock <= 5);
      return matchesQuery && matchesCategory && matchesStock;
    });

    return [...result].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "stock-low") return a.stock - b.stock;
      return String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || ""));
    });
  }, [products, query, category, stockFilter, sort]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModal(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setForm({
      title: product.title, brand: product.brand, sku: product.sku, category: product.category,
      price: product.price, discount: product.discount, purchaseCost: product.purchaseCost || 0,
      stock: product.stock, image: product.image
    });
    setError("");
    setModal(true);
  }

  async function save() {
    if (!form.title.trim() || !form.sku.trim() || !form.category.trim()) {
      setError("نام محصول، SKU و دسته‌بندی الزامی است.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const payload = { ...form, title: form.title.trim(), sku: form.sku.trim(), category: form.category.trim() };
      const response = await fetch(editing ? `/api/admin/products/${editing.id}` : "/api/admin/products", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setError(result.error?.message || "ذخیره محصول انجام نشد.");
        return;
      }
      setModal(false);
      await load();
    } catch {
      setError("خطا در ارتباط با سرور.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(product: Product) {
    if (!confirm(`محصول «${product.title}» حذف شود؟`)) return;
    const response = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok || !result.success) {
      alert(result.error?.message || "حذف محصول انجام نشد.");
      return;
    }
    load();
  }

  function clearFilters() {
    setQuery("");
    setCategory("");
    setStockFilter("all");
    setSort("newest");
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-black text-[var(--primary)]">کاتالوگ و موجودی</div>
          <h1 className="mt-1 text-3xl font-black tracking-tight">محصولات</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">{filtered.length} محصول از {products.length} محصول</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn btn-secondary" type="button"><RefreshCw size={17} />بروزرسانی</button>
          <button onClick={openCreate} className="btn btn-primary" type="button"><Plus size={17} />محصول جدید</button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="card p-4"><div className="text-xs font-bold text-[var(--muted)]">کل محصولات</div><div className="mt-1 text-2xl font-black">{products.length}</div></div>
        <div className="card p-4"><div className="text-xs font-bold text-[var(--muted)]">موجودی کم</div><div className="mt-1 text-2xl font-black text-[var(--warning)]">{products.filter((p) => p.stock > 0 && p.stock <= 5).length}</div></div>
        <div className="card p-4"><div className="text-xs font-bold text-[var(--muted)]">ناموجود</div><div className="mt-1 text-2xl font-black text-[var(--danger)]">{products.filter((p) => p.stock <= 0).length}</div></div>
      </div>

      <div className="card mt-5 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute right-3 top-3.5 text-[var(--muted)]" size={17} />
            <input className="input pr-10" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جستجو: نام، برند، SKU یا دسته‌بندی..." />
          </div>
          <select className="input w-full sm:w-52" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">همه دسته‌بندی‌ها</option>
            {categories.filter((c) => c.active !== false).map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <select className="input w-full sm:w-44" value={stockFilter} onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)}>
            <option value="all">همه موجودی‌ها</option>
            <option value="low">موجودی کم</option>
            <option value="out">ناموجود</option>
          </select>
          <select className="input w-full sm:w-44" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="newest">جدیدترین</option>
            <option value="price-low">ارزان‌ترین</option>
            <option value="price-high">گران‌ترین</option>
            <option value="stock-low">کمترین موجودی</option>
          </select>
          {(query || category || stockFilter !== "all" || sort !== "newest") && (
            <button onClick={clearFilters} type="button" className="btn btn-secondary"><X size={16} />پاک کردن فیلتر</button>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-[var(--muted)]"><SlidersHorizontal size={14} />فیلترها روی همین صفحه اعمال می‌شوند.</div>
      </div>

      <div className="card mt-5 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-[var(--muted)]">در حال دریافت محصولات...</div>
        ) : !filtered.length ? (
          <div className="p-12 text-center">
            <Package className="mx-auto text-[var(--muted)]" size={30} />
            <div className="mt-3 font-black">محصولی مطابق فیلترها پیدا نشد</div>
            <button onClick={clearFilters} className="btn btn-secondary mt-4" type="button">حذف فیلترها</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-right text-sm">
              <thead className="bg-[var(--surface-2)] text-[11px] font-black text-[var(--muted)]">
                <tr><th className="p-4">محصول</th><th className="p-4">دسته‌بندی</th><th className="p-4">SKU</th><th className="p-4">قیمت فروش</th><th className="p-4">قیمت خرید</th><th className="p-4">موجودی</th><th className="p-4">عملیات</th></tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-t border-[var(--border)] hover:bg-[var(--surface-2)]">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-2)]">
                          {product.image ? <img src={product.image} alt={product.title} className="size-full object-cover" /> : <div className="grid size-full place-items-center text-[var(--muted)]"><Package size={18} /></div>}
                        </div>
                        <div><div className="font-black">{product.title}</div><div className="mt-1 text-xs text-[var(--muted)]">{product.brand || "بدون برند"}</div></div>
                      </div>
                    </td>
                    <td className="p-4"><span className="badge bg-[var(--primary)]/10 text-[var(--primary)]">{product.category}</span></td>
                    <td className="p-4 font-mono text-xs">{product.sku}</td>
                    <td className="p-4 font-black">{product.price.toLocaleString("fa-IR")} تومان</td>
                    <td className="p-4 text-[var(--muted)]">{Number(product.purchaseCost || 0).toLocaleString("fa-IR")} تومان</td>
                    <td className="p-4"><span className={`font-black ${product.stock <= 0 ? "text-[var(--danger)]" : product.stock <= 5 ? "text-[var(--warning)]" : ""}`}>{product.stock.toLocaleString("fa-IR")}</span></td>
                    <td className="p-4"><div className="flex gap-2"><button onClick={() => openEdit(product)} className="btn btn-secondary !p-2" type="button"><Pencil size={15} /></button><button onClick={() => remove(product)} className="btn btn-danger !p-2" type="button"><Trash2 size={15} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <Modal title={editing ? "ویرایش محصول" : "ثبت محصول جدید"} onClose={() => setModal(false)}>
          <div className="grid gap-3 sm:grid-cols-2">
            {error && <div className="sm:col-span-2 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
            <div className="sm:col-span-2"><label className="field-label">نام محصول</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><label className="field-label">برند</label><input className="input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></div>
            <div><label className="field-label">SKU</label><input dir="ltr" className="input text-left" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
            <div><label className="field-label">دسته‌بندی</label><select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="">انتخاب دسته‌بندی</option>{categories.filter((c) => c.active !== false).map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div>
            <div><label className="field-label">قیمت فروش</label><input className="input" type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })} /></div>
            <div><label className="field-label">قیمت خرید</label><input className="input" type="number" min="0" value={form.purchaseCost} onChange={(e) => setForm({ ...form, purchaseCost: Number(e.target.value) || 0 })} /></div>
            <div><label className="field-label">درصد تخفیف</label><input className="input" type="number" min="0" max="100" value={form.discount} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) || 0 })} /></div>
            <div><label className="field-label">موجودی</label><input className="input" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) || 0 })} /></div>
            <div className="sm:col-span-2"><label className="field-label">آدرس تصویر</label><input dir="ltr" className="input text-left" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." /></div>
            <button disabled={saving} onClick={save} className="btn btn-primary sm:col-span-2 disabled:opacity-60" type="button">{saving ? "در حال ذخیره..." : "ذخیره محصول"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
