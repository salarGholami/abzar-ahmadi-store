import type { CatalogQuery } from "@/domains/catalog/model/catalog-query";
import { countActiveFilters } from "@/domains/catalog/model/catalog-query";
import type { CatalogResult } from "@/domains/catalog/server/catalog-search.service";
import ActiveFilters from "./ActiveFilters";
import AvailabilityFilter from "./AvailabilityFilter";
import BrandFilter from "./BrandFilter";
import CatalogEmpty from "./CatalogEmpty";
import CatalogPagination from "./CatalogPagination";
import CategoryFilter from "./CategoryFilter";
import FiltersPanel from "./FiltersPanel";
import PriceFilter from "./PriceFilter";
import ProductGrid from "./ProductGrid";
import SortLinks from "./SortLinks";

type Props = {
  basePath: string;
  query: CatalogQuery;
  result: CatalogResult;
  /** Set on category pages: the category is part of the path, not a filter. */
  fixedCategory?: string;
};

/** Server component: the whole listing is rendered as crawlable HTML. */
export default function CatalogView({ basePath, query, result, fixedCategory }: Props) {
  const hasFixedCategory = Boolean(fixedCategory);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
      <aside className="lg:sticky lg:top-[160px]">
        <FiltersPanel activeCount={countActiveFilters(query, { ignoreCategory: hasFixedCategory })}>
          {!hasFixedCategory ? <CategoryFilter basePath={basePath} query={query} categories={result.categories} /> : null}
          <BrandFilter basePath={basePath} query={query} brands={result.brands} />
          <AvailabilityFilter basePath={basePath} query={query} />
          <PriceFilter basePath={basePath} query={query} ceiling={result.priceCeiling} />
        </FiltersPanel>
      </aside>

      <section aria-label="فهرست کالاها" className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
          <SortLinks basePath={basePath} query={query} />
          <p className="text-xs font-bold text-[var(--muted)]">{result.total.toLocaleString("fa-IR")} کالا</p>
        </div>

        <ActiveFilters basePath={basePath} query={query} hideCategory={hasFixedCategory} />

        {result.items.length > 0 ? (
          <>
            <ProductGrid products={result.items} />
            <CatalogPagination basePath={basePath} query={query} page={result.page} totalPages={result.totalPages} />
          </>
        ) : (
          <CatalogEmpty resetHref={basePath} />
        )}
      </section>
    </div>
  );
}
