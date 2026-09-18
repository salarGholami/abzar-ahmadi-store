import { buildCatalogHref, type CatalogQuery } from "@/domains/catalog/model/catalog-query";
import type { CatalogFacet } from "@/domains/catalog/server/catalog-search.service";
import FilterGroup from "./FilterGroup";
import FilterOption from "./FilterOption";

type Props = { basePath: string; query: CatalogQuery; brands: CatalogFacet[] };

export default function BrandFilter({ basePath, query, brands }: Props) {
  if (brands.length === 0) return null;

  return (
    <FilterGroup title="برند">
      <nav aria-label="برند" className="flex max-h-72 flex-col gap-0.5 overflow-y-auto">
        <FilterOption href={buildCatalogHref(basePath, query, { brand: null })} label="همه برندها" active={!query.brand} />
        {brands.map((item) => (
          <FilterOption
            key={item.value}
            href={buildCatalogHref(basePath, query, { brand: item.value })}
            label={item.value}
            count={item.count}
            active={query.brand === item.value}
          />
        ))}
      </nav>
    </FilterGroup>
  );
}
