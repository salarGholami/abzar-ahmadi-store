import {
  buildCatalogHref,
  type CatalogQuery,
} from "@/domains/catalog/model/catalog-query";

type Props = {
  basePath: string;
  query: CatalogQuery;
  ceiling: number;
};

export default function PriceFilter({ basePath, query, ceiling }: Props) {
  if (ceiling <= 0) return null;

  const hidden: Array<[string, string]> = [];

  if (query.q) {
    hidden.push(["q", query.q]);
  }

  if (query.category) {
    hidden.push(["category", query.category]);
  }

  if (query.brand) {
    hidden.push(["brand", query.brand]);
  }

  if (query.sort !== "popular") {
    hidden.push(["sort", query.sort]);
  }

  if (query.availableOnly) {
    hidden.push(["stock", "available"]);
  }

  return (
    <form action={basePath} method="get" className="min-w-0 space-y-3">
      {hidden.map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      <div className="space-y-2">
        <label
          htmlFor="catalog-max-price"
          className="block text-xs font-bold text-[var(--muted)]"
        >
          حداکثر قیمت
        </label>

        <input
          id="catalog-max-price"
          type="number"
          name="maxPrice"
          inputMode="numeric"
          min={1}
          step={10000}
          max={ceiling}
          defaultValue={query.maxPrice ?? ""}
          placeholder={`تا ${ceiling.toLocaleString("fa-IR")}`}
          aria-label="حداکثر قیمت"
          className={[
            "h-11 w-full min-w-0 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--surface-2)]",
            "px-3 text-sm",
            "outline-none",
            "transition-colors",
            "placeholder:text-[var(--muted)]",
            "focus:border-[var(--primary)]",
            "focus:ring-2 focus:ring-[var(--primary)]/10",
          ].join(" ")}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className={[
            "h-10 min-w-0 flex-1 rounded-xl",
            "bg-[var(--primary)]",
            "px-3 text-xs font-black text-white",
            "transition-all",
            "hover:brightness-105",
            "active:scale-[0.98]",
          ].join(" ")}
        >
          اعمال قیمت
        </button>

        {query.maxPrice !== null ? (
          <a
            href={buildCatalogHref(basePath, query, {
              maxPrice: null,
            })}
            rel="nofollow"
            className={[
              "grid h-10 shrink-0 place-items-center",
              "rounded-xl border border-[var(--border)]",
              "px-3 text-xs font-bold",
              "text-[var(--muted)]",
              "transition-colors",
              "hover:border-[var(--primary)]",
              "hover:text-[var(--primary)]",
            ].join(" ")}
          >
            حذف
          </a>
        ) : null}
      </div>
    </form>
  );
}
