import "server-only";

import { listPublicProducts } from "./catalog.service";
import {
  CATALOG_PAGE_SIZE,
  type CatalogQuery,
} from "@/domains/catalog/model/catalog-query";
import type { Product } from "@/domains/catalog/model/catalog.types";

export type CatalogFacet = { value: string; count: number };

export type CatalogResult = {
  items: Product[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  brands: CatalogFacet[];
  categories: CatalogFacet[];
  priceCeiling: number;
};

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Makes Persian search forgiving: Arabic yeh/kaf, ZWNJ, Persian/Arabic digits, casing. */
export function normalizeSearchText(value: string): string {
  return value
    .replace(/[\u064A\u0649]/g, "\u06CC")
    .replace(/\u0643/g, "\u06A9")
    .replace(/[\u200c\u200f\u200e]/g, "")
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)))
    .toLocaleLowerCase("fa")
    .trim();
}

export const finalPrice = (product: Product): number =>
  Math.round(product.price * (1 - (product.discount || 0) / 100));

function searchableText(product: Product): string {
  return normalizeSearchText(
    [product.title, product.brand, product.sku, product.category, product.description]
      .filter((part): part is string => typeof part === "string" && part.length > 0)
      .join(" "),
  );
}

function facet(products: Product[], pick: (product: Product) => string): CatalogFacet[] {
  const counts = new Map<string, number>();
  for (const product of products) {
    const value = pick(product);
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value, "fa"));
}

function compare(sort: CatalogQuery["sort"]): (a: Product, b: Product) => number {
  switch (sort) {
    case "cheap":
      return (a, b) => finalPrice(a) - finalPrice(b);
    case "expensive":
      return (a, b) => finalPrice(b) - finalPrice(a);
    case "stock":
      return (a, b) => b.stock - a.stock;
    default:
      return (a, b) =>
        Number(b.stock > 0) - Number(a.stock > 0) ||
        (b.reviewCount ?? 0) - (a.reviewCount ?? 0) ||
        (b.rating ?? 0) - (a.rating ?? 0);
  }
}

export async function searchCatalog(
  query: CatalogQuery,
  options: { fixedCategory?: string } = {},
): Promise<CatalogResult> {
  const all = await listPublicProducts();
  const needle = normalizeSearchText(query.q);
  const category = options.fixedCategory ?? query.category;

  const matchesText = (product: Product) => !needle || searchableText(product).includes(needle);
  const inText = all.filter(matchesText);
  const inScope = category ? inText.filter((product) => product.category === category) : inText;

  const matched = inScope.filter(
    (product) =>
      (!query.brand || product.brand === query.brand) &&
      (!query.availableOnly || product.stock > 0) &&
      (query.maxPrice === null || finalPrice(product) <= query.maxPrice),
  );

  const sorted = [...matched].sort(compare(query.sort));
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
  const page = Math.min(query.page, totalPages);
  const start = (page - 1) * CATALOG_PAGE_SIZE;

  const ceiling = inScope.reduce((max, product) => Math.max(max, finalPrice(product)), 0);

  return {
    items: sorted.slice(start, start + CATALOG_PAGE_SIZE),
    total,
    page,
    totalPages,
    pageSize: CATALOG_PAGE_SIZE,
    brands: facet(inScope, (product) => product.brand),
    categories: options.fixedCategory ? [] : facet(inText, (product) => product.category),
    priceCeiling: Math.ceil(ceiling / 100_000) * 100_000,
  };
}
