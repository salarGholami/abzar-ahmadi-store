"use client";
import { useEffect, useState, type ReactNode } from "react";
import { Plus, Pencil, Trash2, RefreshCw, Search } from "lucide-react";
import Modal from "../ui/Modal";

export type FieldConfig = {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "select" | "textarea" | "password";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
};

export type ColumnConfig<T> = {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
};

type Row = { id: string; [k: string]: any };

export default function CrudTable<T extends Row>({
  collection, title, fields, columns, searchKeys, canCreate = true, canEdit = true, canDelete = true, extraAction
}: {
  collection: string;
  title: string;
  fields: FieldConfig[];
  columns: ColumnConfig<T>[];
  searchKeys?: string[];
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  extraAction?: (row: T, reload: () => void) => ReactNode;
}) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const r = await fetch(`/api/admin/${collection}`, { cache: "no-store" });
      const j = await r.json();
      if (!j.success) { setLoadError(j.error?.message || "خطا در دریافت اطلاعات"); setRows([]); return; }
      setRows(j.data);
    } catch {
      setLoadError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [collection]);

  const filtered = q
    ? rows.filter((r) => (searchKeys || fields.map((f) => f.key)).some((k) => String(r[k] ?? "").toLowerCase().includes(q.toLowerCase())))
    : rows;

  function openCreate() {
    const init: Record<string, any> = {};
    fields.forEach((f) => { init[f.key] = f.type === "number" ? 0 : ""; });
    setForm(init);
    setEditing(null);
    setError(null);
    setModalOpen(true);
  }
  function openEdit(row: T) {
    setForm({ ...row });
    setEditing(row);
    setError(null);
    setModalOpen(true);
  }
  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, any> = {};
      fields.forEach((f) => { payload[f.key] = f.type === "number" ? Number(form[f.key] || 0) : (form[f.key] ?? ""); });
      const r = editing
        ? await fetch(`/api/admin/${collection}/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch(`/api/admin/${collection}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const j = await r.json();
      if (!r.ok || !j.success) { setError(j.error?.message || "خطا در ذخیره‌سازی"); return; }
      setModalOpen(false);
      load();
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  }
  async function remove(row: T) {
    if (!confirm("این مورد حذف شود؟")) return;
    const r = await fetch(`/api/admin/${collection}/${row.id}`, { method: "DELETE" });
    const j = await r.json();
    if (!r.ok || !j.success) { alert(j.error?.message || "خطا در حذف"); return; }
    load();
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-[var(--primary)]">مدیریت فروشگاه</div>
          <h1 className="mt-1 text-3xl font-black">{title}</h1>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={load} className="btn btn-secondary"><RefreshCw size={17} />بروزرسانی</button>
          {canCreate && <button type="button" onClick={openCreate} className="btn btn-primary"><Plus size={17} />ثبت جدید</button>}
        </div>
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="border-b border-[var(--border)] p-4">
          <div className="relative max-w-lg">
            <Search className="absolute right-3 top-3" size={17} />
            <input className="input pr-10" value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجو..." />
          </div>
        </div>
        {loading ? (
          <div className="p-10 text-center text-[var(--muted)]">در حال دریافت از GitHub...</div>
        ) : loadError ? (
          <div className="p-10 text-center text-red-600 dark:text-red-400">{loadError}</div>
        ) : !filtered.length ? (
          <div className="p-10 text-center text-[var(--muted)]">رکوردی یافت نشد</div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full min-w-[720px] text-right text-sm">
              <thead className="bg-[var(--surface-2)] text-xs text-[var(--muted)]">
                <tr>
                  {columns.map((c) => <th key={c.key} className="p-4">{c.label}</th>)}
                  {(canEdit || canDelete || extraAction) && <th className="p-4">عملیات</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-[var(--border)]">
                    {columns.map((c) => <td key={c.key} className="p-4">{c.render ? c.render(row) : String(row[c.key] ?? "-")}</td>)}
                    {(canEdit || canDelete || extraAction) && (
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {extraAction?.(row, load)}
                          {canEdit && <button type="button" onClick={() => openEdit(row)} className="btn btn-secondary !p-2"><Pencil size={15} /></button>}
                          {canDelete && <button type="button" onClick={() => remove(row)} className="btn btn-danger !p-2"><Trash2 size={15} /></button>}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal title={editing ? "ویرایش رکورد" : "ثبت رکورد جدید"} onClose={() => setModalOpen(false)}>
          <div className="space-y-3">
            {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</div>}
            {fields.map((f) => (
              <div key={f.key}>
                <label className="mb-1 block text-xs font-bold text-[var(--muted)]">{f.label}</label>
                {f.type === "select" ? (
                  <select className="input" value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}>
                    <option value="">انتخاب کنید</option>
                    {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : f.type === "textarea" ? (
                  <textarea className="input min-h-24" value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} />
                ) : (
                  <input
                    className="input"
                    type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "password" ? "password" : "text"}
                    autoComplete={f.type === "password" ? "new-password" : "off"}
                    value={form[f.key] ?? ""}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    required={f.required}
                  />
                )}
              </div>
            ))}
            <button type="button" disabled={saving} onClick={submit} className="btn btn-primary mt-2 w-full disabled:opacity-60">{saving ? "در حال ذخیره..." : "ذخیره"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
