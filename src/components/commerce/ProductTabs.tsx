"use client";

import { useState } from "react";
import type { ProductSpec } from "@/lib/types";

export default function ProductTabs({ description, specs }: { description?: string; specs?: ProductSpec[] }) {
  const hasDescription = Boolean(description?.trim());
  const hasSpecs = Boolean(specs?.length);
  const [tab, setTab] = useState<"description" | "specs">(hasDescription ? "description" : "specs");

  if (!hasDescription && !hasSpecs) return null;

  return (
    <section className="card mt-8 overflow-hidden">
      <div className="flex border-b border-[var(--border)]">
        {hasDescription && (
          <button
            type="button"
            onClick={() => setTab("description")}
            className={`flex-1 border-b-2 px-5 py-4 text-sm font-black transition sm:flex-none sm:px-8 ${tab === "description" ? "border-[var(--primary)] text-[var(--primary)]" : "border-transparent text-[var(--muted)]"}`}
          >
            توضیحات محصول
          </button>
        )}
        {hasSpecs && (
          <button
            type="button"
            onClick={() => setTab("specs")}
            className={`flex-1 border-b-2 px-5 py-4 text-sm font-black transition sm:flex-none sm:px-8 ${tab === "specs" ? "border-[var(--primary)] text-[var(--primary)]" : "border-transparent text-[var(--muted)]"}`}
          >
            مشخصات فنی
          </button>
        )}
      </div>

      <div className="p-5 sm:p-7">
        {tab === "description" && hasDescription && (
          <p className="text-sm leading-8 text-[var(--muted)]">{description}</p>
        )}
        {tab === "specs" && hasSpecs && (
          <div className="divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)]">
            {specs!.map((spec) => (
              <div key={spec.label} className="flex items-center justify-between gap-4 p-4 text-sm">
                <span className="font-bold text-[var(--muted)]">{spec.label}</span>
                <span className="font-black">{spec.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
