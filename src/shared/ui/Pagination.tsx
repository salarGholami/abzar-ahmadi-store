"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  disabled?: boolean;
  className?: string;
};

type PageItem = number | "ellipsis";

function getPageNumbers(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: PageItem[] = [1];

  /*
   * صفحات نزدیک صفحه فعلی
   */
  const start = Math.max(2, currentPage - 1);

  const end = Math.min(totalPages - 1, currentPage + 1);

  /*
   * قبل از محدوده فعلی
   */
  if (start > 2) {
    pages.push("ellipsis");
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  /*
   * بعد از محدوده فعلی
   */
  if (end < totalPages - 1) {
    pages.push("ellipsis");
  }

  /*
   * آخرین صفحه
   */
  pages.push(totalPages);

  return pages;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  disabled = false,
  className = "",
}: PaginationProps) {
  /*
   * اگر pagination عملاً لازم نیست
   */
  if (totalPages <= 1) {
    return null;
  }

  /*
   * جلوگیری از page نامعتبر
   */
  const safeTotalPages = Math.max(1, Math.floor(totalPages));

  const safePage = Math.min(Math.max(Math.floor(page) || 1, 1), safeTotalPages);

  const pageNumbers = getPageNumbers(safePage, safeTotalPages);

  /*
   * محدوده نتایج
   */
  const hasResultRange =
    typeof totalItems === "number" &&
    typeof pageSize === "number" &&
    totalItems > 0 &&
    pageSize > 0;

  const firstItem = hasResultRange ? (safePage - 1) * pageSize + 1 : undefined;

  const lastItem = hasResultRange
    ? Math.min(safePage * pageSize, totalItems)
    : undefined;

  const canGoPrevious = safePage > 1;

  const canGoNext = safePage < safeTotalPages;

  function handlePageChange(nextPage: number) {
    if (disabled) {
      return;
    }

    if (nextPage < 1 || nextPage > safeTotalPages) {
      return;
    }

    if (nextPage === safePage) {
      return;
    }

    onPageChange(nextPage);
  }

  return (
    <nav
      aria-label="صفحه‌بندی"
      dir="rtl"
      className={`
        flex
        flex-col
        gap-4
        border-t
        border-[var(--border)]
        pt-4

        sm:flex-row
        sm:items-center
        sm:justify-between

        ${className}
      `}
    >
      {/* -------------------------------- */}
      {/* RESULT INFORMATION */}
      {/* -------------------------------- */}

      <div
        className="
          text-center
          text-sm
          text-[var(--muted)]

          sm:text-right
        "
      >
        {hasResultRange &&
        typeof firstItem === "number" &&
        typeof lastItem === "number" ? (
          <>
            نمایش{" "}
            <span
              className="
                font-bold
                text-[var(--text)]
              "
            >
              {firstItem.toLocaleString("fa-IR")}
            </span>{" "}
            تا{" "}
            <span
              className="
                font-bold
                text-[var(--text)]
              "
            >
              {lastItem.toLocaleString("fa-IR")}
            </span>{" "}
            از{" "}
            <span
              className="
                font-bold
                text-[var(--text)]
              "
            >
              {totalItems.toLocaleString("fa-IR")}
            </span>{" "}
            نتیجه
          </>
        ) : (
          <>
            صفحه{" "}
            <span
              className="
                font-bold
                text-[var(--text)]
              "
            >
              {safePage.toLocaleString("fa-IR")}
            </span>{" "}
            از{" "}
            <span
              className="
                font-bold
                text-[var(--text)]
              "
            >
              {safeTotalPages.toLocaleString("fa-IR")}
            </span>
          </>
        )}
      </div>

      {/* -------------------------------- */}
      {/* PAGINATION */}
      {/* -------------------------------- */}

      <div
        className="
          flex
          items-center
          justify-center
          gap-1
        "
        dir="ltr"
      >
        {/* PREVIOUS */}

        <button
          type="button"
          onClick={() => handlePageChange(safePage - 1)}
          disabled={!canGoPrevious || disabled}
          aria-label="صفحه قبلی"
          className="
            inline-flex
            h-9
            min-w-9
            items-center
            justify-center
            rounded-xl
            border
            border-[var(--border)]
            bg-[var(--surface)]
            text-[var(--muted)]
            transition

            hover:border-[var(--primary)]
            hover:bg-[var(--primary-light)]
            hover:text-[var(--primary)]

            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-[var(--primary)]/30

            disabled:pointer-events-none
            disabled:opacity-40
          "
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* -------------------------------- */}
        {/* DESKTOP PAGES */}
        {/* -------------------------------- */}

        <div
          className="
            hidden
            items-center
            gap-1
            sm:flex
          "
        >
          {pageNumbers.map((item, index) => {
            /*
             * ELLIPSIS
             */

            if (item === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  aria-hidden="true"
                  className="
                      inline-flex
                      h-9
                      min-w-9
                      items-center
                      justify-center
                      text-[var(--muted)]
                    "
                >
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              );
            }

            /*
             * PAGE
             */

            const isActive = item === safePage;

            return (
              <button
                key={item}
                type="button"
                onClick={() => handlePageChange(item)}
                disabled={disabled}
                aria-current={isActive ? "page" : undefined}
                aria-label={`صفحه ${item.toLocaleString("fa-IR")}`}
                className={`
                    inline-flex
                    h-9
                    min-w-9
                    items-center
                    justify-center
                    rounded-xl
                    border
                    px-2.5
                    text-sm
                    font-bold
                    transition

                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[var(--primary)]/30

                    disabled:pointer-events-none
                    disabled:opacity-50

                    ${
                      isActive
                        ? `
                          border-[var(--primary)]
                          bg-[var(--primary)]
                          text-white
                          shadow-sm
                        `
                        : `
                          border-[var(--border)]
                          bg-[var(--surface)]
                          text-[var(--text)]
                          hover:border-[var(--primary)]
                          hover:bg-[var(--primary-light)]
                          hover:text-[var(--primary)]
                        `
                    }
                  `}
              >
                {item.toLocaleString("fa-IR")}
              </button>
            );
          })}
        </div>

        {/* -------------------------------- */}
        {/* MOBILE CURRENT PAGE */}
        {/* -------------------------------- */}

        <div
          className="
            flex
            h-9
            min-w-20
            items-center
            justify-center
            rounded-xl
            border
            border-[var(--border)]
            bg-[var(--surface)]
            px-3
            text-sm
            font-bold
            text-[var(--text)]

            sm:hidden
          "
          aria-live="polite"
        >
          {safePage.toLocaleString("fa-IR")} /{" "}
          {safeTotalPages.toLocaleString("fa-IR")}
        </div>

        {/* -------------------------------- */}
        {/* NEXT */}
        {/* -------------------------------- */}

        <button
          type="button"
          onClick={() => handlePageChange(safePage + 1)}
          disabled={!canGoNext || disabled}
          aria-label="صفحه بعدی"
          className="
            inline-flex
            h-9
            min-w-9
            items-center
            justify-center
            rounded-xl
            border
            border-[var(--border)]
            bg-[var(--surface)]
            text-[var(--muted)]
            transition

            hover:border-[var(--primary)]
            hover:bg-[var(--primary-light)]
            hover:text-[var(--primary)]

            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-[var(--primary)]/30

            disabled:pointer-events-none
            disabled:opacity-40
          "
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
