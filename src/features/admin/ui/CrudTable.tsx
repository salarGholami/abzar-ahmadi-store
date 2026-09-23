"use client";
import { useState, type ReactNode } from "react";
import { Plus, Pencil, Trash2, RefreshCw, Search, ListFilter, Database } from "lucide-react";
import Modal from "@/shared/ui/Modal";
import { isoToJalali, normalizeJalali } from "@/lib/dates";
import { useAdminCollection, useAdminCrud } from "@/features/admin/hooks";
import type { AdminCollection } from "@/features/admin/api";
import { DashboardBreadcrumb, DashboardHero } from "./DashboardUI";
import Pagination from "@/shared/ui/Pagination";

export type FieldConfig = {
  key: string;
  label: string;
  type?:
    | "text"
    | "number"
    | "date"
    | "jalali-date"
    | "select"
    | "textarea"
    | "password"
    | "boolean";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
};

export type ColumnConfig<T> = {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
};

type FormValue = string | number | boolean;
type Row = { id: string; [k: string]: unknown };

export default function CrudTable<T extends Row>({
  collection,
  title,
  fields,
  columns,
  searchKeys,
  canCreate = true,
  canEdit = true,
  canDelete = true,
  extraAction,
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
  const collectionName = collection as AdminCollection;
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const query = useAdminCollection<T>(collectionName, { page, pageSize: 20, q });
  const crud = useAdminCrud();
  const rows = query.data?.items ?? [];
  const pagination = query.data?.pagination;
  const loading = query.isLoading;
  const loadError = query.error?.message ?? null;
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<Record<string, FormValue>>({});
  const saving = crud.isPending;
  const [error, setError] = useState<string | null>(null);
  const load = () => void query.refetch();

  const filtered = rows;

  function openCreate() {
    const init: Record<string, FormValue> = {};
    fields.forEach((f) => {
      init[f.key] = f.type === "number" ? 0 : f.type === "boolean" ? true : "";
    });
    setForm(init);
    setEditing(null);
    setError(null);
    setModalOpen(true);
  }
  function openEdit(row: T) {
    setForm(
      Object.fromEntries(
        fields.map((f) => [
          f.key,
          f.type === "jalali-date"
            ? normalizeJalali(String(row[f.key] || "")) ||
              isoToJalali(String(row[f.key] || ""))
            : row[f.key],
        ]),
      ) as Record<string, FormValue>,
    );
    setEditing(row);
    setError(null);
    setModalOpen(true);
  }
  async function submit() {
    setError(null);
    try {
      const payload: Record<string, unknown> = {};
      fields.forEach((f) => {
        if (f.type === "number") payload[f.key] = Number(form[f.key] || 0);
        else if (f.type === "boolean") payload[f.key] = Boolean(form[f.key]);
        else if (f.type === "jalali-date")
          payload[f.key] = normalizeJalali(String(form[f.key] || "")) || "";
        else payload[f.key] = form[f.key] ?? "";
      });
      await crud.mutateAsync({
        collection: collectionName,
        action: editing ? "update" : "create",
        id: editing?.id,
        payload,
      });
      setModalOpen(false);
      load();
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
    }
  }
  async function remove(row: T) {
    if (!confirm("این مورد حذف شود؟")) return;
    try {
      await crud.mutateAsync({ collection: collectionName, action: "delete", id: row.id });
      load();
    } catch (cause) {
      alert(cause instanceof Error ? cause.message : "خطا در حذف");
    }
  }

  return (
    <main dir="rtl" className="mx-auto w-full max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <DashboardBreadcrumb current={title} />
        <button type="button" onClick={load} className="btn btn-secondary" disabled={loading}>
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          بروزرسانی
        </button>
      </div>

      <DashboardHero
        eyebrow="مرکز مدیریت فروشگاه"
        title={title}
        description="مدیریت اطلاعات، جست‌وجو و عملیات CRUD این بخش با همان الگوی استاندارد داشبورد فروشگاه."
        icon={Database}
        actions={
          canCreate ? (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-[#00adb5] px-4 py-3 text-sm font-extrabold text-[#10242a] transition hover:bg-[#39c6cb]"
            >
              <Plus size={17} />
              ثبت جدید
            </button>
          ) : null
        }
      />

      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex flex-col justify-between gap-3 border-b border-[var(--border)] p-4 xl:flex-row xl:items-center">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[var(--bg-secondary)] text-[var(--primary)]">
              <ListFilter size={19} />
            </div>
            <div>
              <h2 className="font-black text-[var(--text)]">مرکز کنترل {title}</h2>
              <p className="mt-1 text-[11px] text-[var(--muted)]">
                جست‌وجو، فیلتر و مدیریت اطلاعات
              </p>
            </div>
          </div>

          <div className="text-xs text-[var(--muted)]">
            {pagination?.total.toLocaleString("fa-IR") ?? filtered.length.toLocaleString("fa-IR")} رکورد
          </div>
        </div>

        <div className="border-b border-[var(--border)] p-4">
          <div className="relative max-w-xl">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2" size={17} />
            <input
              className="input w-full pr-10"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="جست‌وجو در اطلاعات..."
            />
          </div>
        </div>
        {loading ? (
          <div className="p-10 text-center text-[var(--muted)]">
            در حال دریافت از GitHub...
          </div>
        ) : loadError ? (
          <div className="p-10 text-center text-red-600 dark:text-red-400">
            {loadError}
          </div>
        ) : !filtered.length ? (
          <div className="p-10 text-center text-[var(--muted)]">
            رکوردی یافت نشد
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full min-w-[720px] text-right text-sm">
              <thead className="bg-[var(--surface-2)] text-xs text-[var(--muted)]">
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} className="p-4">
                      {c.label}
                    </th>
                  ))}
                  {(canEdit || canDelete || extraAction) && (
                    <th className="p-4">عملیات</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, index) => (
                  <tr
                    key={String(row.id ?? "") + "-" + index}
                    className="border-t border-[var(--border)]"
                  >
                    {columns.map((c) => (
                      <td key={c.key} className="p-4">
                        {c.render ? c.render(row) : String(row[c.key] ?? "-")}
                      </td>
                    ))}
                    {(canEdit || canDelete || extraAction) && (
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {extraAction?.(row, load)}
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => openEdit(row)}
                              className="btn btn-secondary !p-2"
                            >
                              <Pencil size={15} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => remove(row)}
                              className="btn btn-danger !p-2"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination ? <Pagination pagination={pagination} onPageChange={setPage} /> : null}
      </section>

      {modalOpen && (
        <Modal
          title={editing ? "ویرایش رکورد" : "ثبت رکورد جدید"}
          onClose={() => setModalOpen(false)}
        >
          <div className="space-y-3">
            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            )}
            {fields.map((f) => (
              <div key={f.key}>
                <label className="mb-1 block text-xs font-bold text-[var(--muted)]">
                  {f.label}
                </label>
                {f.type === "boolean" ? (
                  <select
                    className="input"
                    value={form[f.key] ? "1" : "0"}
                    onChange={(e) =>
                      setForm({ ...form, [f.key]: e.target.value === "1" })
                    }
                  >
                    <option value="1">بله</option>
                    <option value="0">خیر</option>
                  </select>
                ) : f.type === "select" ? (
                  <select
                    className="input"
                    value={String(form[f.key] ?? "")}
                    onChange={(e) =>
                      setForm({ ...form, [f.key]: e.target.value })
                    }
                  >
                    <option value="">انتخاب کنید</option>
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : f.type === "textarea" ? (
                  <textarea
                    className="input min-h-24"
                    value={String(form[f.key] ?? "")}
                    onChange={(e) =>
                      setForm({ ...form, [f.key]: e.target.value })
                    }
                    placeholder={f.placeholder}
                  />
                ) : (
                  <input
                    className="input"
                    dir={f.type === "jalali-date" ? "ltr" : undefined}
                    inputMode={f.type === "jalali-date" ? "numeric" : undefined}
                    type={
                      f.type === "number"
                        ? "number"
                        : f.type === "date"
                          ? "date"
                          : f.type === "password"
                            ? "password"
                            : "text"
                    }
                    autoComplete={
                      f.type === "password" ? "new-password" : "off"
                    }
                    value={String(form[f.key] ?? "")}
                    onChange={(e) =>
                      setForm({ ...form, [f.key]: e.target.value })
                    }
                    placeholder={
                      f.type === "jalali-date" ? "۱۴۰۵/۰۷/۱۵" : f.placeholder
                    }
                    required={f.required}
                  />
                )}
              </div>
            ))}
            <button
              type="button"
              disabled={saving}
              onClick={submit}
              className="btn btn-primary mt-2 w-full disabled:opacity-60"
            >
              {saving ? "در حال ذخیره..." : "ذخیره"}
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
