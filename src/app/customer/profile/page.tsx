"use client";

import { useEffect, useState } from "react";
import { Save, RefreshCw } from "lucide-react";
import { EmptyState, PageHeader, Panel } from "@/features/portal/ui/PortalUI";
import { request } from "@/shared/api/client";

type Profile = {
  user: { name: string; phone: string };
  customer: { address?: string; email?: string } | null;
};

export default function ProfilePage() {
  const [data, setData] = useState<Profile | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setMessage("");
    try {
      const result = await request<Profile>({ url: "/account/profile", method: "GET" });
      setData(result);
      setForm({
        name: result.user.name,
        phone: result.user.phone,
        address: result.customer?.address ?? "",
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "خطا در دریافت پروفایل");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      await request({ url: "/account/profile", method: "PATCH", data: form });
      setMessage("اطلاعات با موفقیت ذخیره و با رکورد مشتری همگام شد.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ذخیره اطلاعات انجام نشد");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="پروفایل"
        description="اطلاعات این فرم مستقیماً در حساب کاربری و رکورد مشتری ذخیره می‌شود."
        actions={
          <button type="button" onClick={() => void load()} className="btn btn-secondary" disabled={loading}>
            <RefreshCw size={15} /> بروزرسانی
          </button>
        }
      />
      {loading && !data ? <EmptyState message="در حال بارگذاری..." /> : (
        <Panel title="مشخصات مشتری">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="field-label">نام
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
          <button type="button" onClick={() => void save()} disabled={saving} className="btn btn-primary mt-4">
            <Save size={16} /> {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>
        </Panel>
      )}
    </div>
  );
}
