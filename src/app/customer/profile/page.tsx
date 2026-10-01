"use client";

import { useEffect, useState } from "react";
import { EmptyState, PageHeader, Panel } from "@/features/portal/ui/PortalUI";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] py-3 text-sm last:border-0">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<{ name: string; phone: string; role: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j) => setUser(j.data || null))
      .catch(() => setUser(null));
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader title="پروفایل" description="اطلاعات حساب کاربری شما." />
      {!user ? (
        <EmptyState message="در حال بارگذاری..." />
      ) : (
        <Panel title="مشخصات">
          <Row label="نام" value={user.name} />
          <Row label="موبایل" value={user.phone} />
          <Row label="نقش" value="مشتری" />
        </Panel>
      )}
    </div>
  );
}
