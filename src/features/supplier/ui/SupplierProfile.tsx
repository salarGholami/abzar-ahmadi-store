"use client";

import { useEffect, useState } from "react";
import { EmptyState, PageHeader, Panel } from "@/features/portal/ui/PortalUI";

type ProfileData = {
  user: { id: string; name: string; phone: string; role: string };
  supplierId: string;
  supplier: { id: string; name: string; phone?: string; address?: string } | null;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] py-3 text-sm last:border-0">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="font-bold text-[var(--text)]">{value}</span>
    </div>
  );
}

export default function SupplierProfile() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/supplier/profile")
      .then((r) => r.json())
      .then((j) => {
        if (!j.success) setError(j.error?.message || "خطا");
        else setData(j.data);
      })
      .catch(() => setError("خطا در ارتباط با سرور"));
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader
        title="پروفایل کسب‌وکار"
        description="اطلاعات حساب و رکورد تأمین‌کننده متصل به این ورود."
      />
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}
      {!data ? (
        <EmptyState message="در حال بارگذاری..." />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="حساب کاربری">
            <Row label="نام" value={data.user.name} />
            <Row label="موبایل" value={data.user.phone} />
            <Row label="نقش" value="تأمین‌کننده" />
          </Panel>
          <Panel title="رکورد تأمین‌کننده">
            {data.supplier ? (
              <>
                <Row label="نام کسب‌وکار" value={data.supplier.name} />
                <Row label="تلفن" value={data.supplier.phone || "—"} />
                <Row label="آدرس" value={data.supplier.address || "—"} />
                <Row label="شناسه" value={data.supplier.id} />
              </>
            ) : (
              <EmptyState message={`رکورد تأمین‌کننده ${data.supplierId} یافت نشد.`} />
            )}
          </Panel>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-900 lg:col-span-2">
            ویرایش مشخصات کسب‌وکار از پنل مدیر انجام می‌شود. برای تغییر رمز از بازیابی رمز در صفحه ورود استفاده کنید.
          </div>
        </div>
      )}
    </div>
  );
}
