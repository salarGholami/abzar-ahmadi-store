"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMeta } from "@/lib/pagination";

export default function Pagination(props: {
  pagination?: PaginationMeta;
  page?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  disabled?: boolean;
  className?: string;
  onPageChange: (page: number) => void;
}) {
  const pagination: PaginationMeta = props.pagination ?? {
    page: props.page ?? 1,
    pageSize: props.pageSize ?? 20,
    total: props.totalItems ?? 0,
    totalPages: props.totalPages ?? 1,
  };
  const { onPageChange, disabled = false, className = "" } = props;

  if (pagination.totalPages <= 1) {
    return (
      <div className={`flex items-center justify-between gap-3 border-t border-[var(--border)] px-4 py-3 text-xs text-[var(--muted)] ${className}`}>
        <span>{pagination.total.toLocaleString("fa-IR")} رکورد</span>
      </div>
    );
  }

  const pages = new Set<number>([
    1,
    pagination.totalPages,
    pagination.page - 1,
    pagination.page,
    pagination.page + 1,
  ]);
  const visible = [...pages]
    .filter((page) => page >= 1 && page <= pagination.totalPages)
    .sort((a, b) => a - b);

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] px-4 py-3 ${className}`}>
      <div className="text-xs text-[var(--muted)]">
        صفحه {pagination.page.toLocaleString("fa-IR")} از{" "}
        {pagination.totalPages.toLocaleString("fa-IR")} ·{" "}
        {pagination.total.toLocaleString("fa-IR")} رکورد
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={disabled || pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
          className="btn btn-secondary !p-2 disabled:opacity-40"
          aria-label="صفحه قبل"
        >
          <ChevronRight size={15} />
        </button>

        {visible.map((page, index) => {
          const previous = visible[index - 1];
          const gap = previous !== undefined && page - previous > 1;

          return (
            <span key={page} className="flex items-center gap-1">
              {gap ? <span className="px-1 text-xs text-[var(--muted)]">…</span> : null}
              <button
                type="button"
                disabled={disabled}
                onClick={() => onPageChange(page)}
                className={
                  page === pagination.page
                    ? "grid size-9 place-items-center rounded-lg bg-[var(--primary)] text-white text-xs font-black"
                    : "grid size-9 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs font-bold hover:bg-[var(--surface-2)]"
                }
              >
                {page.toLocaleString("fa-IR")}
              </button>
            </span>
          );
        })}

        <button
          type="button"
          disabled={disabled || pagination.page >= pagination.totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
          className="btn btn-secondary !p-2 disabled:opacity-40"
          aria-label="صفحه بعد"
        >
          <ChevronLeft size={15} />
        </button>
      </div>
    </div>
  );
}
