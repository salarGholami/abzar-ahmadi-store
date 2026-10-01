import { buildCatalogHref, type CatalogQuery } from "@/domains/catalog/model/catalog-query";
import FilterGroup from "./FilterGroup";
import FilterOption from "./FilterOption";

type Props = { basePath: string; query: CatalogQuery };

export default function AvailabilityFilter({ basePath, query }: Props) {
  return (
    <FilterGroup title="موجودی">
      <nav aria-label="موجودی" className="flex flex-col gap-0.5">
        <FilterOption href={buildCatalogHref(basePath, query, { stock: null })} label="همه کالاها" active={!query.availableOnly} />
        <FilterOption href={buildCatalogHref(basePath, query, { stock: "available" })} label="فقط کالاهای موجود" active={query.availableOnly} />
      </nav>
    </FilterGroup>
  );
}
