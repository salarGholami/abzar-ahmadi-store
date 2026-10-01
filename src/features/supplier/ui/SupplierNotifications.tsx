"use client";

import { useEffect, useState } from "react";
import { EmptyState, PageHeader, Panel, faDate } from "@/features/portal/ui/PortalUI";

type N = { id: string; title: string; message: string; read: boolean; createdAt: string; type?: string };

export default function SupplierNotifications() {
  const [rows, setRows] = useState<N[] | null>(null);

  useEffect(() => {
    fetch("/api/account/notifications")
      .then((r) => r.json())
      .then((j) => setRows(j.data || []))
      .catch(() => setRows([]));
  }, []);

  async function markRead(id: string) {
    await fetch("/api/account/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setRows((prev) => (prev || []).map((x) => (x.id === id ? { ...x, read: true } : x)));
  }

  return (
    <div className="space-y-5">
      <PageHeader title="اعلان‌ها" description="پیام‌های مربوط به سفارش‌ها و همکاری." />
      {!rows ? (
        <EmptyState message="در حال بارگذاری..." />
      ) : !rows.length ? (
        <EmptyState message="اعلان جدیدی ندارید." />
      ) : (
        <div className="space-y-3">
          {rows.map((x) => (
            <Panel key={x.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-black">{x.title}</div>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{x.message}</p>
                  <div className="mt-2 text-xs text-[var(--muted)]">{faDate(x.createdAt)}</div>
                </div>
                {!x.read ? (
                  <button
                    type="button"
                    onClick={() => void markRead(x.id)}
                    className="shrink-0 rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs font-bold"
                  >
                    خواندم
                  </button>
                ) : (
                  <span className="text-xs text-[var(--muted)]">خوانده‌شده</span>
                )}
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
