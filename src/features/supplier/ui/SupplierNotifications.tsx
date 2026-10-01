"use client";

import { useMemo, useState } from "react";
import { EmptyState, PageHeader, Panel, faDate } from "@/features/portal/ui/PortalUI";
import { useCustomerNotifications, useMarkNotificationRead } from "@/features/customer/hooks";
import { paginate } from "@/lib/pagination";
import Pagination from "@/shared/ui/Pagination";

const PAGE_SIZE = 10;

export default function SupplierNotifications() {
  const { data: rows = [], isLoading } = useCustomerNotifications();
  const markRead = useMarkNotificationRead();
  const [page, setPage] = useState(1);
  const result = useMemo(() => paginate(rows, page, PAGE_SIZE), [rows, page]);

  return (
    <div className="space-y-5">
      <PageHeader title="اعلان‌ها" description="پیام‌های مربوط به سفارش‌ها و همکاری." />
      {isLoading ? (
        <EmptyState message="در حال بارگذاری..." />
      ) : !rows.length ? (
        <EmptyState message="اعلان جدیدی ندارید." />
      ) : (
        <div className="space-y-3">
          {result.items.map((x) => (
            <Panel key={x.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-black">{x.title}</div>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{x.message}</p>
                  <div className="mt-2 text-xs text-[var(--muted)]">{faDate(x.createdAt)}</div>
                </div>
                {!x.read ? (
                  <button type="button" onClick={() => markRead.mutate(x.id)} className="shrink-0 rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs font-bold">
                    خواندم
                  </button>
                ) : (
                  <span className="text-xs text-[var(--muted)]">خوانده‌شده</span>
                )}
              </div>
            </Panel>
          ))}
          <Pagination pagination={result.pagination} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
