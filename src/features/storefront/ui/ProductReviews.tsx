"use client";

import { useProductReviews } from "@/features/reviews/hooks";

export default function ProductReviews({ productId }: { productId: string }) {
  const { data: rows = [], isLoading } = useProductReviews(productId);

  return (
    <section className="mt-8 card p-5 sm:p-7">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-[var(--primary)]">نظر خریداران</div>
          <h2 className="mt-1 text-xl font-black">نظرات کاربران</h2>
        </div>
        <div className="text-sm text-[var(--muted)]">{rows.length} دیدگاه تأییدشده</div>
      </div>
      {isLoading ? (
        <div className="mt-5 rounded-2xl bg-[var(--surface-2)] p-6 text-center text-sm text-[var(--muted)]">در حال بارگذاری...</div>
      ) : rows.length ? (
        <div className="mt-5 divide-y divide-[var(--border)]">
          {rows.map((row) => (
            <article key={row.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between">
                <b>{row.title || "نظر کاربر"}</b>
                <span className="text-amber-500">{"★".repeat(Math.max(0, Math.min(5, Number(row.rating))))}</span>
              </div>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{row.body}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl bg-[var(--surface-2)] p-6 text-center text-sm text-[var(--muted)]">هنوز دیدگاه تأییدشده‌ای ثبت نشده است.</div>
      )}
    </section>
  );
}
