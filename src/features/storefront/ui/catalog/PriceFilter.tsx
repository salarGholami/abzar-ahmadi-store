import { buildCatalogHref, type CatalogQuery } from "@/domains/catalog/model/catalog-query";
import FilterGroup from "./FilterGroup";

type Props = { basePath: string; query: CatalogQuery; ceiling: number };

/** Plain GET form: works without JS and keeps the URL shareable. */
export default function PriceFilter({ basePath, query, ceiling }: Props) {
  if (ceiling <= 0) return null;

  const hidden: [string, string][] = [];
  if (query.q) hidden.push(["q", query.q]);
  if (query.category) hidden.push(["category", query.category]);
  if (query.brand) hidden.push(["brand", query.brand]);
  if (query.sort !== "popular") hidden.push(["sort", query.sort]);
  if (query.availableOnly) hidden.push(["stock", "available"]);

  return (
    <FilterGroup title="حداکثر قیمت (تومان)">
      <form action={basePath} method="get" className="flex flex-col gap-2">
        {hidden.map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <input
          type="number"
          name="maxPrice"
          inputMode="numeric"
          min={1}
          step={10000}
          max={ceiling}
          defaultValue={query.maxPrice ?? ""}
          placeholder={`تا ${ceiling.toLocaleString("fa-IR")}`}
          aria-label="حداکثر قیمت"
          className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-xs outline-none focus:border-[var(--primary)]/50"
        />
        <div className="flex gap-2">
          <button type="submit" className="h-9 flex-1 rounded-xl bg-[var(--primary)] text-xs font-black text-white transition hover:bg-[var(--primary-2)]">
            اعمال
          </button>
          {query.maxPrice !== null ? (
            <a
              href={buildCatalogHref(basePath, query, { maxPrice: null })}
              rel="nofollow"
              className="grid h-9 place-items-center rounded-xl border border-[var(--border)] px-3 text-xs font-bold text-[var(--muted)]"
            >
              حذف
            </a>
          ) : null}
        </div>
      </form>
    </FilterGroup>
  );
}
