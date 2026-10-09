import {
  buildCatalogHref,
  type CatalogQuery,
} from "@/domains/catalog/model/catalog-query";
import type { CatalogFacet } from "@/domains/catalog/server/catalog-search.service";
import FilterOption from "./FilterOption";

type Props = {
  basePath: string;
  query: CatalogQuery;
  brands: CatalogFacet[];
};

export default function BrandFilter({ basePath, query, brands }: Props) {
  if (brands.length === 0) return null;

  return (
    <nav aria-label="برند" className="min-w-0 space-y-1">
      <FilterOption
        href={buildCatalogHref(basePath, query, {
          brand: null,
        })}
        label="همه برندها"
        active={!query.brand}
      />

      <div className="max-h-64 overflow-y-auto overscroll-contain pe-1">
        <div className="space-y-1">
          {brands.map((item) => (
            <FilterOption
              key={item.value}
              href={buildCatalogHref(basePath, query, {
                brand: item.value,
              })}
              label={item.value}
              count={item.count}
              active={query.brand === item.value}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
