"use client";
import { useEffect, useState } from "react";
import CrudTable from "@/components/dashboard/CrudTable";
import type { AppUser, StoreSettings } from "@/lib/types";

function StoreSettingsForm() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings", { cache: "no-store" }).then((r) => r.json()).then((j) => {
      if (j.success && j.data[0]) setSettings(j.data[0]);
    }).finally(() => setLoading(false));
  }, []);

  async function save() {
    if (!settings) return;
    setSaving(true); setSaved(false);
    try {
      const r = await fetch(`/api/admin/settings/${settings.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      const j = await r.json();
      if (j.success) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="card p-6 text-center text-[var(--muted)]">در حال بارگذاری...</div>;
  if (!settings) return <div className="card p-6 text-center text-[var(--muted)]">تنظیمات یافت نشد</div>;

  return (
    <div className="card space-y-4 p-6">
      <h3 className="font-black">تنظیمات فروشگاه</h3>
      <div>
        <label className="mb-1 block text-xs font-bold text-[var(--muted)]">نام فروشگاه</label>
        <input className="input" value={settings.storeName} onChange={(e) => setSettings({ ...settings, storeName: e.target.value })} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold text-[var(--muted)]">تلفن فروشگاه</label>
        <input className="input" value={settings.storePhone} onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold text-[var(--muted)]">شماره کارت جهت واریز مشتریان</label>
          <input className="input" value={settings.cardNumber} onChange={(e) => setSettings({ ...settings, cardNumber: e.target.value })} placeholder="xxxx-xxxx-xxxx-xxxx" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-[var(--muted)]">نام صاحب حساب</label>
          <input className="input" value={settings.cardHolderName} onChange={(e) => setSettings({ ...settings, cardHolderName: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold text-[var(--muted)]">آستانه هشدار موجودی کم</label>
        <input className="input" type="number" value={settings.lowStockThreshold} onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) || 0 })} />
      </div>
      <button type="button" onClick={save} disabled={saving} className="btn btn-primary disabled:opacity-60">{saving ? "در حال ذخیره..." : saved ? "ذخیره شد ✓" : "ذخیره تنظیمات"}</button>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <div>
        <div className="text-sm font-bold text-[var(--primary)]">مدیریت فروشگاه</div>
        <h1 className="mt-1 text-3xl font-black">تنظیمات</h1>
      </div>
      <StoreSettingsForm />
      <CrudTable<AppUser>
        collection="users"
        title="کاربران و دسترسی‌ها"
        searchKeys={["name", "phone"]}
        fields={[
          { key: "name", label: "نام کاربر", required: true },
          { key: "phone", label: "شماره موبایل", required: true },
          { key: "password", label: "رمز عبور (برای تغییر پر کنید)", type: "password" }
        ]}
        columns={[
          { key: "name", label: "نام" },
          { key: "phone", label: "موبایل" },
          { key: "role", label: "دسترسی", render: (user) => <span className="badge bg-[var(--primary)]/10 text-[var(--primary)]">مدیر سیستم</span> }
        ]}
      />
    </div>
  );
}
