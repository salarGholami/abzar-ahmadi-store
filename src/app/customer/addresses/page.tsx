"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { EmptyState, PageHeader } from "@/features/portal/ui/PortalUI";

type Address = {
  id: string;
  title: string;
  recipientName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  isDefault: boolean;
};

const empty = {
  title: "آدرس من",
  recipientName: "",
  phone: "",
  province: "",
  city: "",
  address: "",
  postalCode: "",
};

export default function AddressesPage() {
  const [list, setList] = useState<Address[] | null>(null);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const r = await fetch("/api/account/addresses");
    const j = await r.json();
    if (j.success) setList(j.data);
    else setError(j.error?.message || "خطا");
  }

  useEffect(() => {
    load().catch(() => setError("خطا در دریافت آدرس‌ها"));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = await r.json();
      if (!j.success) throw new Error(j.error?.message || "خطا");
      setForm(empty);
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err.message || "خطا");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("این آدرس حذف شود؟")) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/account/addresses?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const j = await r.json();
      if (!j.success) throw new Error(j.error?.message || "خطا");
      await load();
    } catch (err: any) {
      setError(err.message || "خطا");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="آدرس‌های من"
        description="مدیریت آدرس‌های تحویل سفارش."
        actions={
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-white"
          >
            <Plus size={16} /> آدرس جدید
          </button>
        }
      />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {showForm ? (
        <form
          onSubmit={save}
          className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"
        >
          {(
            [
              ["title", "عنوان"],
              ["recipientName", "نام گیرنده"],
              ["phone", "موبایل"],
              ["province", "استان"],
              ["city", "شهر"],
              ["postalCode", "کد پستی (۱۰ رقم)"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-sm">
              <span className="mb-1 block font-semibold">{label}</span>
              <input
                className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3"
                value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={key !== "title"}
              />
            </label>
          ))}
          <label className="block text-sm">
            <span className="mb-1 block font-semibold">آدرس کامل</span>
            <textarea
              className="min-h-24 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="h-11 w-full rounded-xl bg-[var(--primary)] text-sm font-bold text-white disabled:opacity-60"
          >
            {busy ? "در حال ذخیره..." : "ذخیره آدرس"}
          </button>
        </form>
      ) : null}

      {!list ? (
        <EmptyState message="در حال بارگذاری..." />
      ) : !list.length ? (
        <EmptyState message="هنوز آدرسی ثبت نکرده‌اید." />
      ) : (
        <div className="space-y-3">
          {list.map((a) => (
            <article
              key={a.id}
              className="flex items-start justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
            >
              <div className="flex gap-3">
                <span className="rounded-xl bg-[var(--surface-2)] p-2.5 text-[var(--primary)]">
                  <MapPin size={18} />
                </span>
                <div>
                  <div className="font-black">
                    {a.title}{" "}
                    {a.isDefault ? (
                      <span className="text-xs font-bold text-[var(--primary)]">(پیش‌فرض)</span>
                    ) : null}
                  </div>
                  <div className="mt-1 text-sm">
                    {a.recipientName} · {a.phone}
                  </div>
                  <div className="mt-1 text-xs leading-6 text-[var(--muted)]">
                    {a.province}، {a.city} — {a.address}
                    <br />
                    کد پستی: {a.postalCode}
                  </div>
                </div>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => remove(a.id)}
                className="rounded-xl border border-[var(--border)] p-2 text-[var(--muted)] hover:text-red-600"
                aria-label="حذف"
              >
                <Trash2 size={16} />
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
