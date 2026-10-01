import { buildCatalogHref, type CatalogQuery } from "@/domains/catalog/model/catalog-query";
import type { CatalogFacet } from "@/domains/catalog/server/catalog-search.service";
import FilterGroup from "./FilterGroup";
import FilterOption from "./FilterOption";

type Props = { basePath: string; query: CatalogQuery; categories: CatalogFacet[] };

export default function CategoryFilter({ basePath, query, categories }: Props) {
  if (categories.length === 0) return null;

  return (
    <FilterGroup title="دسته‌بندی">
      <nav aria-label="دسته‌بندی" className="flex max-h-72 flex-col gap-0.5 overflow-y-auto">
        <FilterOption href={buildCatalogHref(basePath, query, { category: null })} label="همه دسته‌ها" active={!query.category} />
        {categories.map((item) => (
          <FilterOption
            key={item.value}
            href={buildCatalogHref(basePath, query, { category: item.value })}
            label={item.value}
            count={item.count}
            active={query.category === item.value}
          />
        ))}
      </nav>
    </FilterGroup>
  );
}
