import {
  buildCatalogHref,
  type CatalogQuery,
} from "@/domains/catalog/model/catalog-query";
import FilterOption from "./FilterOption";

type Props = {
  basePath: string;
  query: CatalogQuery;
};

export default function AvailabilityFilter({ basePath, query }: Props) {
  return (
    <nav aria-label="وضعیت موجودی" className="min-w-0 space-y-1">
      <FilterOption
        href={buildCatalogHref(basePath, query, {
          stock: null,
        })}
        label="همه کالاها"
        active={!query.availableOnly}
      />

      <FilterOption
        href={buildCatalogHref(basePath, query, {
          stock: "available",
        })}
        label="فقط کالاهای موجود"
        active={query.availableOnly}
      />
    </nav>
  );
}
