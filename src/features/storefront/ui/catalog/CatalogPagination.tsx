import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildCatalogHref, type CatalogQuery } from "@/domains/catalog/model/catalog-query";

type Props = { basePath: string; query: CatalogQuery; page: number; totalPages: number };

type Item = number | "gap";

function pageWindow(current: number, total: number): Item[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const items: Item[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("gap");
  for (let value = start; value <= end; value += 1) items.push(value);
  if (end < total - 1) items.push("gap");
  items.push(total);
  return items;
}

const base = "grid size-10 place-items-center rounded-xl border text-xs font-black transition";

export default function CatalogPagination({ basePath, query, page, totalPages }: Props) {
  if (totalPages <= 1) return null;

  const href = (target: number) => buildCatalogHref(basePath, query, { page: target > 1 ? String(target) : null });

  return (
    <nav aria-label="صفحه‌بندی" className="mt-8 flex items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" aria-label="صفحه قبل" className={`${base} border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]/40`}>
          <ChevronRight size={16} />
        </Link>
      ) : null}

      {pageWindow(page, totalPages).map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} aria-hidden className="px-1 text-[var(--muted)]">…</span>
        ) : (
          <Link
            key={item}
            href={href(item)}
            aria-current={item === page ? "page" : undefined}
            aria-label={`صفحه ${item.toLocaleString("fa-IR")}`}
            className={`${base} ${item === page ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]/40"}`}
          >
            {item.toLocaleString("fa-IR")}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link href={href(page + 1)} rel="next" aria-label="صفحه بعد" className={`${base} border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]/40`}>
          <ChevronLeft size={16} />
        </Link>
      ) : null}
    </nav>
  );
}
