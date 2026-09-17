/**
 * Pure (server + client safe) catalog query contract.
 * The URL is the single source of truth for listing state, so every listing
 * is shareable, crawlable and renderable on the server.
 */

export const CATALOG_PAGE_SIZE = 20;
export const CATALOG_MAX_PAGE = 500;

export const CATALOG_SORTS = ["popular", "cheap", "expensive", "stock"] as const;
export type CatalogSort = (typeof CATALOG_SORTS)[number];

export const CATALOG_SORT_LABELS: Record<CatalogSort, string> = {
  popular: "پرطرفدارترین",
  cheap: "ارزان‌ترین",
  expensive: "گران‌ترین",
  stock: "بیشترین موجودی",
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

export type CatalogQuery = {
  q: string;
  category: string;
  brand: string;
  sort: CatalogSort;
  availableOnly: boolean;
  maxPrice: number | null;
  page: number;
};

export type CatalogParamKey = "q" | "category" | "brand" | "sort" | "stock" | "maxPrice" | "page";
export type CatalogChanges = Partial<Record<CatalogParamKey, string | null>>;

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

const isSort = (value: string | undefined): value is CatalogSort =>
  value !== undefined && (CATALOG_SORTS as readonly string[]).includes(value);

const toPositiveInt = (value: string | undefined): number | null => {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export function parseCatalogQuery(raw: RawSearchParams): CatalogQuery {
  const sort = first(raw.sort);
  const page = toPositiveInt(first(raw.page)) ?? 1;

  return {
    q: (first(raw.q) ?? "").trim().slice(0, 100),
    category: (first(raw.category) ?? "").trim().slice(0, 100),
    brand: (first(raw.brand) ?? "").trim().slice(0, 100),
    sort: isSort(sort) ? sort : "popular",
    availableOnly: first(raw.stock) === "available",
    maxPrice: toPositiveInt(first(raw.maxPrice)),
    page: Math.min(page, CATALOG_MAX_PAGE),
  };
}

/** True when the URL carries anything besides the page number (=> duplicate content, must be noindex). */
export function isFilteredQuery(query: CatalogQuery): boolean {
  return Boolean(
    query.q ||
      query.category ||
      query.brand ||
      query.availableOnly ||
      query.maxPrice !== null ||
      query.sort !== "popular",
  );
}

export function countActiveFilters(query: CatalogQuery, options: { ignoreCategory?: boolean } = {}): number {
  return [
    Boolean(query.q),
    Boolean(query.category) && !options.ignoreCategory,
    Boolean(query.brand),
    query.availableOnly,
    query.maxPrice !== null,
  ].filter(Boolean).length;
}

function queryToParams(query: CatalogQuery): Record<CatalogParamKey, string | null> {
  return {
    q: query.q || null,
    category: query.category || null,
    brand: query.brand || null,
    sort: query.sort === "popular" ? null : query.sort,
    stock: query.availableOnly ? "available" : null,
    maxPrice: query.maxPrice !== null ? String(query.maxPrice) : null,
    page: query.page > 1 ? String(query.page) : null,
  };
}

/** Builds a listing URL. Any change other than `page` resets pagination. */
export function buildCatalogHref(basePath: string, query: CatalogQuery, changes: CatalogChanges = {}): string {
  const params = queryToParams(query);
  if (!("page" in changes)) params.page = null;

  for (const key of Object.keys(changes) as CatalogParamKey[]) {
    params[key] = changes[key] ?? null;
  }

  const search = new URLSearchParams();
  (Object.keys(params) as CatalogParamKey[]).forEach((key) => {
    const value = params[key];
    if (value !== null && value !== "" && !(key === "page" && value === "1")) search.set(key, value);
  });

  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}
