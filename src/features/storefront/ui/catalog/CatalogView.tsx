import type { CatalogQuery } from "@/domains/catalog/model/catalog-query";
import { countActiveFilters } from "@/domains/catalog/model/catalog-query";
import type { CatalogResult } from "@/domains/catalog/server/catalog-search.service";

import ActiveFilters from "./ActiveFilters";
import AvailabilityFilter from "./AvailabilityFilter";
import BrandFilter from "./BrandFilter";
import CatalogEmpty from "./CatalogEmpty";
import CatalogPagination from "./CatalogPagination";
import CategoryFilter from "./CategoryFilter";
import FiltersPanel, { FilterSection } from "./FiltersPanel";
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

export default function CatalogView({
  basePath,
  query,
  result,
  fixedCategory,
}: Props) {
  const hasFixedCategory = Boolean(fixedCategory);

  const activeFilterCount = countActiveFilters(query, {
    ignoreCategory: hasFixedCategory,
  });

  return (
    <div className="grid min-w-0 gap-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start lg:gap-6">
      {/* Desktop filter sidebar */}
      <aside className="hidden min-w-0 lg:block">
        <div className="sticky top-36 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="border-b border-[var(--border)] px-5 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--primary)]">
                  FILTER
                </p>
                <h2 className="text-base font-black tracking-tight">
                  فیلتر محصولات
                </h2>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                  محصول مناسب خودت را سریع‌تر پیدا کن
                </p>
              </div>

              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-sm font-black text-[var(--primary)]">
                {result.total.toLocaleString("fa-IR")}
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-[var(--primary)]/15 bg-[var(--primary)]/5 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="size-2 shrink-0 rounded-full bg-[var(--primary)]" />
                  <span className="text-xs font-bold text-[var(--primary)]">
                    {activeFilterCount.toLocaleString("fa-IR")} فعال
                  </span>
                </div>

                <a
                  href={basePath}
                  className="shrink-0 text-[11px] font-black text-[var(--muted)] transition-colors hover:text-[var(--primary)]"
                >
                  پاک کردن
                </a>
              </div>
            )}
          </div>

          <div className="divide-y divide-[var(--border)]">
            {!hasFixedCategory && (
              <section className="px-5 py-5">
                <div className="mb-4">
                  <h3 className="text-sm font-black">دسته‌بندی</h3>
                  <p className="mt-1 text-[11px] text-[var(--muted)]">
                    نوع ابزار موردنظر را انتخاب کنید
                  </p>
                </div>
                <CategoryFilter
                  basePath={basePath}
                  query={query}
                  categories={result.categories}
                />
              </section>
            )}

            <section className="px-5 py-5">
              <div className="mb-4">
                <h3 className="text-sm font-black">برند</h3>
                <p className="mt-1 text-[11px] text-[var(--muted)]">
                  برند مورد اعتماد خودت را انتخاب کن
                </p>
              </div>
              <BrandFilter
                basePath={basePath}
                query={query}
                brands={result.brands}
              />
            </section>

            <section className="px-5 py-5">
              <div className="mb-4">
                <h3 className="text-sm font-black">وضعیت موجودی</h3>
                <p className="mt-1 text-[11px] text-[var(--muted)]">
                  فقط کالاهای قابل سفارش را ببین
                </p>
              </div>
              <AvailabilityFilter basePath={basePath} query={query} />
            </section>

            <section className="px-5 py-5">
              <div className="mb-4">
                <h3 className="text-sm font-black">محدوده قیمت</h3>
                <p className="mt-1 text-[11px] text-[var(--muted)]">
                  بودجه مناسب خودت را مشخص کن
                </p>
              </div>
              <PriceFilter
                basePath={basePath}
                query={query}
                ceiling={result.priceCeiling}
              />
            </section>
          </div>

          <div className="border-t border-[var(--border)] bg-[var(--surface-2)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold text-[var(--muted)]">
                  نتیجه جستجو
                </p>
                <p className="mt-0.5 text-sm font-black">
                  {result.total.toLocaleString("fa-IR")} محصول
                </p>
              </div>

              {activeFilterCount > 0 && (
                <a
                  href={basePath}
                  className="shrink-0 rounded-xl border border-[var(--border)] px-3 py-2 text-[11px] font-black transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                >
                  حذف فیلترها
                </a>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Product area */}
      <section aria-label="فهرست کالاها" className="min-w-0 space-y-4">
        {/* Responsive toolbar */}
        <div className="relative z-20 grid min-w-0 grid-cols-1 gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm lg:flex lg:items-center lg:justify-between lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none">
          {/* Right side in RTL: filter button and result count */}
          <div className="flex min-w-0 items-center justify-between gap-3 lg:justify-start">
            <div className="flex min-w-0 items-center gap-3">
              <FiltersPanel activeCount={activeFilterCount}>
                {!hasFixedCategory && (
                  <FilterSection
                    title="دسته‌بندی"
                    description="نوع ابزار موردنظر را انتخاب کنید"
                  >
                    <CategoryFilter
                      basePath={basePath}
                      query={query}
                      categories={result.categories}
                    />
                  </FilterSection>
                )}

                <FilterSection
                  title="برند"
                  description="برند مورد اعتماد خودت را انتخاب کن"
                >
                  <BrandFilter
                    basePath={basePath}
                    query={query}
                    brands={result.brands}
                  />
                </FilterSection>

                <FilterSection
                  title="وضعیت موجودی"
                  description="فقط کالاهای قابل سفارش را ببین"
                >
                  <AvailabilityFilter basePath={basePath} query={query} />
                </FilterSection>

                <FilterSection
                  title="محدوده قیمت"
                  description="بودجه مناسب خودت را مشخص کن"
                >
                  <PriceFilter
                    basePath={basePath}
                    query={query}
                    ceiling={result.priceCeiling}
                  />
                </FilterSection>
              </FiltersPanel>

              <span className="hidden size-2 shrink-0 rounded-full bg-[var(--primary)] sm:block" />

              <p className="whitespace-nowrap text-xs font-bold text-[var(--muted)]">
                <span className="font-black text-[var(--foreground)]">
                  {result.total.toLocaleString("fa-IR")}
                </span>{" "}
                محصول
              </p>
            </div>
          </div>

          {/* Sort: full width on mobile, natural width on desktop */}
          <div className="min-w-0 w-full lg:w-auto lg:shrink-0">
            <SortLinks basePath={basePath} query={query} />
          </div>
        </div>

        <ActiveFilters
          basePath={basePath}
          query={query}
          hideCategory={hasFixedCategory}
        />

        {result.items.length > 0 ? (
          <>
            <ProductGrid products={result.items} />
            <CatalogPagination
              basePath={basePath}
              query={query}
              page={result.page}
              totalPages={result.totalPages}
            />
          </>
        ) : (
          <CatalogEmpty resetHref={basePath} />
        )}
      </section>
    </div>
  );
}
