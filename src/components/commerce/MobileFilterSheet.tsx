"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

/* =========================================================
   Types
========================================================= */

export type PaginationProps = {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  visiblePages?: number;
  showInfo?: boolean;
  className?: string;
};

/* =========================================================
   Helpers
========================================================= */

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

/* =========================================================
   Page Range (always ascending)
========================================================= */

function createPageRange(
  currentPage: number,
  totalPages: number,
  visiblePages: number,
): Array<number | "dots"> {
  const maxVisible = Math.max(3, Math.min(7, visiblePages || 5));

  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: Array<number | "dots"> = [];
  const sideCount = 1; // how many pages to show around current

  // Always show first page
  pages.push(1);

  const left = Math.max(2, currentPage - sideCount);
  const right = Math.min(totalPages - 1, currentPage + sideCount);

  if (left > 2) {
    pages.push("dots");
  }

  for (let i = left; i <= right; i++) {
    pages.push(i);
  }

  if (right < totalPages - 1) {
    pages.push("dots");
  }

  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

/* =========================================================
   Pagination
========================================================= */

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  visiblePages = 5,
  showInfo = true,
  className = "",
}: PaginationProps) {
  const safePageSize = Math.max(1, Math.floor(pageSize) || 1);
  const safeTotalItems = Math.max(0, Math.floor(totalItems) || 0);
  const totalPages = Math.max(1, Math.ceil(safeTotalItems / safePageSize));
  const safeCurrentPage = clamp(Math.floor(currentPage) || 1, 1, totalPages);

  if (safeTotalItems === 0 || totalPages <= 1) {
    return null;
  }

  const pageRange = createPageRange(safeCurrentPage, totalPages, visiblePages);

  const startItem = (safeCurrentPage - 1) * safePageSize + 1;
  const endItem = Math.min(safeCurrentPage * safePageSize, safeTotalItems);

  const goToPage = (page: number) => {
    const next = clamp(page, 1, totalPages);
    if (next !== safeCurrentPage) {
      onPageChange(next);
    }
  };

  return (
    <nav
      aria-label="صفحه‌بندی"
      className={["mt-10 w-full", className].filter(Boolean).join(" ")}
    >
      {/* ========== کنترل‌ها ========== */}
      <div className="flex justify-center">
        {/* 
          مهم: dir="ltr" 
          تا اعداد همیشه از چپ به راست ۱ ۲ ۳ نمایش داده شوند
          و فلش‌ها هم جهت درست داشته باشند
        */}
        <div
          dir="ltr"
          className="
            inline-flex items-center gap-1
            rounded-2xl
            border border-black/[0.06]
            bg-white
            p-1.5
            shadow-[0_4px_20px_rgba(0,0,0,0.04)]
            dark:border-white/[0.08]
            dark:bg-[#1e2329]
          "
        >
          {/* قبلی */}
          <button
            type="button"
            onClick={() => goToPage(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1}
            aria-label="صفحه قبلی"
            className="
              group flex h-9 w-9 items-center justify-center
              rounded-xl
              text-[#393E46]/60
              transition-all duration-200
              hover:bg-[#00ADB5]/10 hover:text-[#00ADB5]
              disabled:pointer-events-none disabled:opacity-30
              dark:text-white/50
              dark:hover:bg-[#00ADB5]/15 dark:hover:text-[#00ADB5]
            "
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          </button>

          {/* صفحات */}
          <div className="flex items-center gap-0.5 px-1">
            {pageRange.map((item, index) => {
              if (item === "dots") {
                return (
                  <span
                    key={`dots-${index}`}
                    className="
                      flex h-9 w-7 items-center justify-center
                      text-[12px] font-bold tracking-widest
                      text-[#393E46]/30
                      dark:text-white/25
                    "
                  >
                    ···
                  </span>
                );
              }

              const isActive = item === safeCurrentPage;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => goToPage(item)}
                  aria-label={`صفحه ${formatNumber(item)}`}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "relative flex h-9 min-w-9 items-center justify-center",
                    "rounded-xl px-2.5",
                    "text-[13px] font-bold tabular-nums",
                    "transition-all duration-200",
                    isActive
                      ? "bg-[#00ADB5] text-white shadow-[0_4px_14px_rgba(0,173,181,0.35)]"
                      : "text-[#393E46]/70 hover:bg-[#00ADB5]/[0.08] hover:text-[#00ADB5] dark:text-white/60 dark:hover:bg-[#00ADB5]/15 dark:hover:text-[#00ADB5]",
                  ].join(" ")}
                >
                  {formatNumber(item)}
                </button>
              );
            })}
          </div>

          {/* بعدی */}
          <button
            type="button"
            onClick={() => goToPage(safeCurrentPage + 1)}
            disabled={safeCurrentPage === totalPages}
            aria-label="صفحه بعدی"
            className="
              group flex h-9 w-9 items-center justify-center
              rounded-xl
              text-[#393E46]/60
              transition-all duration-200
              hover:bg-[#00ADB5]/10 hover:text-[#00ADB5]
              disabled:pointer-events-none disabled:opacity-30
              dark:text-white/50
              dark:hover:bg-[#00ADB5]/15 dark:hover:text-[#00ADB5]
            "
          >
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* ========== اطلاعات ========== */}
      {showInfo && (
        <div className="mt-4 text-center" dir="rtl">
          <p className="text-[11px] font-medium text-[#393E46]/45 dark:text-white/40">
            نمایش{" "}
            <span className="font-bold text-[#393E46]/70 dark:text-white/70">
              {formatNumber(startItem)}
            </span>
            {" – "}
            <span className="font-bold text-[#393E46]/70 dark:text-white/70">
              {formatNumber(endItem)}
            </span>
            {" از "}
            <span className="font-black text-[#00ADB5]">
              {formatNumber(safeTotalItems)}
            </span>
            {" محصول"}
          </p>
        </div>
      )}
    </nav>
  );
}
