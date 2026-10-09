"use client";

import { useEffect, useState } from "react";
import { GitCompareArrows, Eye } from "lucide-react";

export default function ProductTools({ productId }: { productId: string }) {
  const [inCompare, setInCompare] = useState(false);

  useEffect(() => {
    try {
      const recent = JSON.parse(
        localStorage.getItem("recentlyViewed") || "[]",
      ) as string[];
      localStorage.setItem(
        "recentlyViewed",
        JSON.stringify(
          [productId, ...recent.filter((x) => x !== productId)].slice(0, 12),
        ),
      );

      const compare = JSON.parse(
        localStorage.getItem("compare") || "[]",
      ) as string[];
      setInCompare(compare.includes(productId));
    } catch {
      /* ignore */
    }
  }, [productId]);

  function toggleCompare() {
    try {
      const current = JSON.parse(
        localStorage.getItem("compare") || "[]",
      ) as string[];
      const next = current.includes(productId)
        ? current.filter((x) => x !== productId)
        : [...current.filter((x) => x !== productId), productId].slice(-4);
      localStorage.setItem("compare", JSON.stringify(next));
      setInCompare(next.includes(productId));
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={toggleCompare}
        aria-pressed={inCompare}
        className={`
          inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-extrabold transition
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]
          ${
            inCompare
              ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
              : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5"
          }
        `}
      >
        <GitCompareArrows size={16} aria-hidden />
        {inCompare ? "در لیست مقایسه" : "افزودن به مقایسه"}
      </button>

      <span className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--surface-2)] px-3.5 py-2.5 text-xs font-bold text-[var(--muted)]">
        <Eye size={15} aria-hidden />
        ذخیره در آخرین بازدیدها
      </span>
    </div>
  );
}
