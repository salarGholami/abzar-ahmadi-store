"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { EmptyState, PageHeader, Panel } from "@/features/portal/ui/PortalUI";
import { useSupplierProfile } from "../hooks";
import { supplierApi } from "../api";

export default function SupplierProfile() {
  const { data, isLoading, error, refetch } = useSupplierProfile();
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!data || initialized) return;
    setForm({
      name: data.user.name,
      phone: data.user.phone,
      address: data.supplier?.address ?? "",
    });
    setInitialized(true);
  }, [data, initialized]);

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      await supplierApi.updateProfile(form);
      setMessage("اطلاعات حساب و رکورد تأمین‌کننده همگام شد.");
      await refetch();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "ذخیره اطلاعات انجام نشد");
    } finally {
      setSaving(false);
    }
  }

  return <div className="space-y-5">
    <PageHeader title="پروفایل کسب‌وکار" description="تغییرات این فرم همزمان در حساب ورود و رکورد تأمین‌کننده ذخیره می‌شود." />
    {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error.message}</div> : null}
    {isLoading || !data ? <EmptyState message="در حال بارگذاری..." /> : (
      <Panel title="مشخصات تأمین‌کننده">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field-label">نام / برند
            <input className="input mt-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="field-label">موبایل
            <input className="input mt-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label className="field-label sm:col-span-2">آدرس
            <textarea className="input mt-2 min-h-28" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </label>
        </div>
        {message ? <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm">{message}</div> : null}
        <button type="button" disabled={saving} onClick={() => void save()} className="btn btn-primary mt-4">
          <Save size={16} /> {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </button>
      </Panel>
    )}
  </div>;
}
