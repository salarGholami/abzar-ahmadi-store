"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Pencil, Trash2, Tags, Search } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type { Category, Product } from "@/lib/types";

type Form = { name: string; slug: string; description: string; active: boolean };

const emptyForm: Form = { name: "", slug: "", description: "", active: true };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [categoriesResponse, productsResponse] = await Promise.all([
        fetch("/api/admin/categories", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/admin/products", { cache: "no-store" }).then((r) => r.json())
      ]);
      setCategories(categoriesResponse.success ? categoriesResponse.data : []);
      setProducts(productsResponse.success ? productsResponse.data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const rows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return categories.filter((category) =>
      !normalized || `${category.name} ${category.slug}`.toLowerCase().includes(normalized)
    );
  }, [categories, query]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModal(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      active: category.active !== false
    });
    setError("");
    setModal(true);
  }

  async function save() {
    if (!form.name.trim()) {
      setError("نام دسته‌بندی الزامی است.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || form.name.trim().toLowerCase().replace(/\s+/g, "-"),
        description: form.description.trim(),
        active: form.active
      };

      const response = await fetch(
        editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error?.message || "ذخیره دسته‌بندی انجام نشد.");
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

  async function remove(category: Category) {
    const count = products.filter((product) => product.category === category.name).length;
    if (count > 0) {
      alert(`این دسته‌بندی ${count} محصول دارد. ابتدا دسته‌بندی محصولات را تغییر دهید.`);
      return;
    }
    if (!confirm(`دسته‌بندی «${category.name}» حذف شود؟`)) return;

    const response = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok || !result.success) {
      alert(result.error?.message || "حذف انجام نشد.");
      return;
    }
    load();
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-black text-[var(--primary)]">کاتالوگ فروشگاه</div>
          <h1 className="mt-1 text-3xl font-black tracking-tight">دسته‌بندی محصولات</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">ساختار کاتالوگ، فیلتر فروشگاه و سازمان‌دهی محصولات را از اینجا کنترل کنید.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn btn-secondary" type="button"><RefreshCw size={17} />بروزرسانی</button>
          <button onClick={openCreate} className="btn btn-primary" type="button"><Plus size={17} />دسته‌بندی جدید</button>
        </div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <div className="card p-5"><div className="text-xs font-bold text-[var(--muted)]">کل دسته‌بندی‌ها</div><div className="mt-2 text-3xl font-black">{categories.length}</div></div>
        <div className="card p-5"><div className="text-xs font-bold text-[var(--muted)]">دسته‌های فعال</div><div className="mt-2 text-3xl font-black">{categories.filter((item) => item.active !== false).length}</div></div>
        <div className="card p-5"><div className="text-xs font-bold text-[var(--muted)]">محصولات سازمان‌یافته</div><div className="mt-2 text-3xl font-black">{products.filter((item) => item.category).length}</div></div>
      </div>

      <div className="card mt-5 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] p-4">
          <div>
            <h2 className="font-black">فهرست دسته‌بندی‌ها</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">{rows.length} مورد</p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute right-3 top-3.5 text-[var(--muted)]" size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="input pr-10" placeholder="جستجوی دسته‌بندی..." />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-[var(--muted)]">در حال دریافت اطلاعات...</div>
        ) : !rows.length ? (
          <div className="p-12 text-center">
            <Tags className="mx-auto text-[var(--muted)]" size={28} />
            <div className="mt-3 font-black">دسته‌بندی‌ای وجود ندارد</div>
            <p className="mt-1 text-sm text-[var(--muted)]">اولین دسته‌بندی را ایجاد کنید.</p>
          </div>
        ) : (
          <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((category) => {
              const productCount = products.filter((product) => product.category === category.name).length;
              return (
                <div key={category.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]"><Tags size={19} /></div>
                      <div className="min-w-0">
                        <div className="truncate font-black">{category.name}</div>
                        <div className="mt-1 truncate text-[11px] text-[var(--muted)]">/{category.slug}</div>
                      </div>
                    </div>
                    <span className={`badge ${category.active === false ? "bg-red-50 text-red-600 dark:bg-red-950/30" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"}`}>
                      {category.active === false ? "غیرفعال" : "فعال"}
                    </span>
                  </div>
                  <p className="mt-4 min-h-10 text-xs leading-5 text-[var(--muted)]">{category.description || "بدون توضیحات"}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
                    <span className="text-xs font-bold text-[var(--muted)]">{productCount} محصول</span>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(category)} className="btn btn-secondary !p-2" type="button" aria-label="ویرایش"><Pencil size={15} /></button>
                      <button onClick={() => remove(category)} className="btn btn-danger !p-2" type="button" aria-label="حذف"><Trash2 size={15} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal && (
        <Modal title={editing ? "ویرایش دسته‌بندی" : "ایجاد دسته‌بندی"} onClose={() => setModal(false)}>
          <div className="space-y-4">
            {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
            <div><label className="mb-1.5 block text-xs font-bold text-[var(--muted)]">نام دسته‌بندی</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثلاً ابزار برقی" /></div>
            <div><label className="mb-1.5 block text-xs font-bold text-[var(--muted)]">Slug</label><input dir="ltr" className="input text-left" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="power-tools" /></div>
            <div><label className="mb-1.5 block text-xs font-bold text-[var(--muted)]">توضیحات</label><textarea className="input min-h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="توضیح کوتاه برای مدیریت کاتالوگ..." /></div>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] p-3 text-sm font-bold"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />دسته‌بندی فعال باشد</label>
            <button disabled={saving} onClick={save} className="btn btn-primary w-full disabled:opacity-60" type="button">{saving ? "در حال ذخیره..." : "ذخیره دسته‌بندی"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
