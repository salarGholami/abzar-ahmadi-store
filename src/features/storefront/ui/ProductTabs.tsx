"use client";

import {
  Check,
  FileText,
  ListChecks,
  Sparkles,
  CircleCheck,
} from "lucide-react";
import { useState } from "react";

import type { ProductSpec } from "@/lib/types";

type ProductTabsProps = {
  description?: string;
  specs?: ProductSpec[];
};

export default function ProductTabs({
  description,
  specs,
}: ProductTabsProps) {
  const hasDescription = Boolean(description?.trim());
  const hasSpecs = Boolean(specs?.length);

  const [tab, setTab] = useState<"description" | "specs">(
    hasDescription ? "description" : "specs",
  );

  if (!hasDescription && !hasSpecs) return null;

  return (
    <section
      dir="rtl"
      className="
        mt-8
        overflow-hidden
        rounded-[26px]
        border border-[var(--border)]
        bg-[var(--surface)]
        shadow-[0_18px_60px_rgba(0,0,0,0.045)]
      "
    >
      {/* =========================================================
          TOP HEADER
      ========================================================= */}
      <div
        className="
          relative
          overflow-hidden
          border-b border-[var(--border)]
          bg-[var(--bg)]
          px-5
          pb-0
          pt-5
          sm:px-7
          sm:pt-6
        "
      >
        {/* Decorative */}
        <div className="pointer-events-none absolute -left-12 -top-16 size-36 rounded-full bg-[var(--primary)]/[0.07] blur-3xl" />

        <div className="pointer-events-none absolute -right-20 bottom-0 size-40 rounded-full bg-[var(--primary)]/[0.045] blur-3xl" />

        {/* Header */}
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          {/* Title */}
          <div className="flex items-start gap-3">
            <div className="grid size-12 shrink-0 place-items-center rounded-[15px] bg-[var(--primary)] text-white shadow-[0_8px_22px_rgba(0,173,181,0.2)]">
              <ListChecks size={21} />
            </div>

            <div className="pb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight sm:text-xl">
                  اطلاعات محصول
                </h2>

                <span className="rounded-full bg-[var(--primary)]/10 px-2.5 py-1 text-[10px] font-black text-[var(--primary)]">
                  کامل
                </span>
              </div>

              <p className="mt-1.5 text-[11px] font-medium leading-6 text-[var(--muted)] sm:text-[12px]">
                توضیحات، ویژگی‌ها و مشخصات فنی محصول
              </p>
            </div>
          </div>

          {/* Mini info */}
          <div className="hidden items-center gap-2 pb-2 sm:flex">
            {hasDescription && (
              <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
                <FileText
                  size={14}
                  className="text-[var(--primary)]"
                />

                <span className="text-[10px] font-black text-[var(--muted)]">
                  توضیحات
                </span>
              </div>
            )}

            {hasSpecs && (
              <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
                <ListChecks
                  size={14}
                  className="text-[var(--primary)]"
                />

                <span className="text-[10px] font-black text-[var(--muted)]">
                  {specs!.length.toLocaleString("fa-IR")} مشخصه
                </span>
              </div>
            )}
          </div>
        </div>

        {/* =======================================================
            TABS
        ======================================================= */}
        <div className="relative mt-5 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {hasDescription && (
            <button
              type="button"
              onClick={() => setTab("description")}
              className={`
                group
                relative
                flex
                min-w-[150px]
                shrink-0
                items-center
                justify-center
                gap-2.5
                rounded-[14px]
                px-5
                py-3.5
                text-[12px]
                font-black
                transition-all
                duration-200
                sm:min-w-[175px]
                sm:py-4
                ${
                  tab === "description"
                    ? "bg-[var(--surface)] text-[var(--primary)] shadow-[0_5px_18px_rgba(0,0,0,0.05)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface)]/70 hover:text-[var(--text)]"
                }
              `}
            >
              <span
                className={`
                  grid size-8 place-items-center rounded-[10px] transition
                  ${
                    tab === "description"
                      ? "bg-[var(--primary)]/10"
                      : "bg-[var(--surface)]"
                  }
                `}
              >
                <FileText size={16} />
              </span>

              توضیحات محصول

              {tab === "description" && (
                <span className="absolute bottom-0 right-4 left-4 h-[3px] rounded-full bg-[var(--primary)]" />
              )}
            </button>
          )}

          {hasSpecs && (
            <button
              type="button"
              onClick={() => setTab("specs")}
              className={`
                group
                relative
                flex
                min-w-[150px]
                shrink-0
                items-center
                justify-center
                gap-2.5
                rounded-[14px]
                px-5
                py-3.5
                text-[12px]
                font-black
                transition-all
                duration-200
                sm:min-w-[175px]
                sm:py-4
                ${
                  tab === "specs"
                    ? "bg-[var(--surface)] text-[var(--primary)] shadow-[0_5px_18px_rgba(0,0,0,0.05)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface)]/70 hover:text-[var(--text)]"
                }
              `}
            >
              <span
                className={`
                  grid size-8 place-items-center rounded-[10px] transition
                  ${
                    tab === "specs"
                      ? "bg-[var(--primary)]/10"
                      : "bg-[var(--surface)]"
                  }
                `}
              >
                <ListChecks size={16} />
              </span>

              مشخصات فنی

              {tab === "specs" && (
                <span className="absolute bottom-0 right-4 left-4 h-[3px] rounded-full bg-[var(--primary)]" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* =========================================================
          CONTENT
      ========================================================= */}
      <div className="p-5 sm:p-7 lg:p-8">
        {/* =======================================================
            DESCRIPTION
        ======================================================= */}
        {tab === "description" && hasDescription && (
          <div className="animate-in fade-in duration-300">
            <div className="grid gap-7 lg:grid-cols-[230px_1fr]">
              {/* Side */}
              <div>
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-[12px] bg-[var(--primary)]/10 text-[var(--primary)]">
                    <Sparkles size={18} />
                  </span>

                  <div>
                    <h3 className="text-base font-black">
                      درباره محصول
                    </h3>

                    <p className="mt-1 text-[11px] font-medium text-[var(--muted)]">
                      معرفی و توضیحات کامل
                    </p>
                  </div>
                </div>

                <div className="mt-6 hidden rounded-[17px] border border-[var(--border)] bg-[var(--bg)] p-4 lg:block">
                  <div className="flex items-center gap-2.5">
                    <CircleCheck
                      size={16}
                      className="text-emerald-500"
                    />

                    <span className="text-[11px] font-black">
                      اطلاعات محصول
                    </span>
                  </div>

                  <p className="mt-2.5 text-[10px] font-medium leading-6 text-[var(--muted)]">
                    اطلاعات ارائه‌شده توسط فروشگاه برای این محصول
                    ثبت شده است.
                  </p>
                </div>
              </div>

              {/* Main */}
              <div className="min-w-0">
                <div className="relative overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--bg)]">
                  <div className="absolute right-0 top-0 h-full w-[3px] bg-[var(--primary)]" />

                  <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4 sm:px-6">
                    <span className="text-[11px] font-black text-[var(--muted)]">
                      توضیحات محصول
                    </span>

                    <span className="flex items-center gap-2 text-[10px] font-bold text-[var(--muted)]">
                      <Check
                        size={13}
                        className="text-emerald-500"
                      />

                      اطلاعات محصول
                    </span>
                  </div>

                  <div className="px-5 py-6 sm:px-7 sm:py-7">
                    <p className="text-[14px] font-medium leading-9 text-[var(--muted)] sm:text-[15px] sm:leading-10">
                      {description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================
            SPECIFICATIONS
        ======================================================= */}
        {tab === "specs" && hasSpecs && (
          <div className="animate-in fade-in duration-300">
            {/* Header */}
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-[14px] bg-[var(--primary)]/10 text-[var(--primary)]">
                  <ListChecks size={20} />
                </div>

                <div>
                  <h3 className="text-base font-black sm:text-lg">
                    مشخصات فنی محصول
                  </h3>

                  <p className="mt-1 text-[10px] font-medium leading-5 text-[var(--muted)] sm:text-[11px]">
                    بررسی جزئیات و ویژگی‌های فنی
                  </p>
                </div>
              </div>

              <span className="w-fit rounded-xl bg-[var(--bg)] px-3.5 py-2.5 text-[10px] font-black text-[var(--muted)]">
                {specs!.length.toLocaleString("fa-IR")} مشخصه
              </span>
            </div>

            {/* Specs */}
            <div className="overflow-hidden rounded-[20px] border border-[var(--border)]">
              {specs!.map((spec, index) => (
                <div
                  key={`${spec.label}-${index}`}
                  className={`
                    group
                    grid
                    gap-3
                    px-4
                    py-4.5
                    transition-colors
                    sm:grid-cols-[0.7fr_1.3fr]
                    sm:items-center
                    sm:gap-8
                    sm:px-6
                    sm:py-5
                    ${
                      index !== specs!.length - 1
                        ? "border-b border-[var(--border)]"
                        : ""
                    }
                    ${
                      index % 2 === 0
                        ? "bg-[var(--surface)]"
                        : "bg-[var(--bg)]/[0.5]"
                    }
                    hover:bg-[var(--primary)]/[0.035]
                  `}
                >
                  {/* Label */}
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-[9px] bg-[var(--primary)]/10 text-[var(--primary)] transition group-hover:bg-[var(--primary)] group-hover:text-white">
                      <Check
                        size={13}
                        strokeWidth={3}
                      />
                    </span>

                    <span className="text-[12px] font-bold text-[var(--muted)] sm:text-[13px]">
                      {spec.label}
                    </span>
                  </div>

                  {/* Value */}
                  <div className="pr-10 text-[13px] font-black leading-7 text-[var(--text)] sm:pr-0 sm:text-[14px]">
                    {spec.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom note */}
            <div className="mt-5 flex items-start gap-3 rounded-[17px] border border-[var(--border)] bg-[var(--bg)] px-4 py-4">
              <div className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-[var(--primary)]/10 text-[var(--primary)]">
                <ListChecks size={15} />
              </div>

              <div>
                <div className="text-[10px] font-black sm:text-[11px]">
                  درباره مشخصات
                </div>

                <p className="mt-1 text-[10px] font-medium leading-6 text-[var(--muted)] sm:text-[11px]">
                  مشخصات فنی نمایش داده‌شده بر اساس اطلاعات ثبت‌شده
                  برای این محصول هستند.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

