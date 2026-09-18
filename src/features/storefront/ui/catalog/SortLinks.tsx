import Link from "next/link";
import {
  CATALOG_SORTS,
  CATALOG_SORT_LABELS,
  buildCatalogHref,
  type CatalogQuery,
} from "@/domains/catalog/model/catalog-query";

export default function SortLinks({ basePath, query }: { basePath: string; query: CatalogQuery }) {
  return (
    <nav aria-label="مرتب‌سازی" className="flex min-w-0 items-center gap-2 overflow-x-auto [scrollbar-width:none]">
      <span className="shrink-0 text-xs font-bold text-[var(--muted)]">مرتب‌سازی:</span>
      {CATALOG_SORTS.map((sort) => {
        const active = query.sort === sort;
        return (
          <Link
            key={sort}
            href={buildCatalogHref(basePath, query, { sort: sort === "popular" ? null : sort })}
            prefetch={false}
            rel="nofollow"
            aria-current={active ? "true" : undefined}
            className={[
              "shrink-0 rounded-full px-3.5 py-2 text-xs font-black transition",
              active ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-2)] text-[var(--text)] hover:text-[var(--primary)]",
            ].join(" ")}
          >
            {CATALOG_SORT_LABELS[sort]}
          </Link>
        );
      })}
    </nav>
  );
}
