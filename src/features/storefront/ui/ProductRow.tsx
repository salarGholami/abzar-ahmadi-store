import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { Product } from "@/lib/types";

import ProductHorizontalScroller from "./ProductHorizontalScroller";

interface ProductRowProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref?: string;
}

export default function ProductRow({
  title,
  subtitle,
  products,
  viewAllHref,
}: ProductRowProps) {
  if (!products.length) return null;

  return (
    <section className="w-full py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-[1450px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-end justify-between gap-5">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-black text-[var(--primary)]">
              <span className="grid size-6 place-items-center rounded-lg bg-[var(--primary)]/10">
                <Sparkles size={13} />
              </span>
              پیشنهاد فروشگاه
            </div>

            <h2 className="text-xl font-black tracking-tight sm:text-2xl lg:text-3xl">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-1.5 truncate text-xs font-bold text-[var(--muted)] sm:text-sm">
                {subtitle}
              </p>
            )}
          </div>

          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="group flex shrink-0 items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-[10px] font-black text-[var(--primary)] transition hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5"
            >
              مشاهده همه
              <ArrowLeft
                size={14}
                className="transition-transform group-hover:-translate-x-1"
              />
            </Link>
          )}
        </div>

        {/* Products */}
        <div className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[0_15px_60px_rgba(0,0,0,0.045)] sm:p-4">
          <ProductHorizontalScroller products={products} />
        </div>
      </div>
    </section>
  );
}
