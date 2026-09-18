import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CATALOG_PAGE_SIZE, isFilteredQuery, parseCatalogQuery, type RawSearchParams } from "@/domains/catalog/model/catalog-query";
import { listActiveCategories, normalizeSearchText, searchCatalog } from "@/domains/catalog/server";
import CatalogView from "@/features/storefront/ui/catalog/CatalogView";
import JsonLd from "@/shared/seo/JsonLd";
import { SITE_NAME, absoluteUrl, breadcrumbLd } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawSearchParams>;
};

/** Next passes non-ASCII (Persian) dynamic segments percent-encoded; decode before matching. */
function decodeSlug(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

async function findCategory(rawSlug: string) {
  const slug = normalizeSearchText(decodeSlug(rawSlug));
  const categories = await listActiveCategories();
  return (
    categories.find(
      (item) => normalizeSearchText(item.slug ?? "") === slug || normalizeSearchText(item.id) === slug,
    ) ?? null
  );
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [{ slug }, raw] = await Promise.all([params, searchParams]);
  const category = await findCategory(slug);
  if (!category) return { title: "دسته‌بندی پیدا نشد", robots: { index: false, follow: false } };

  const query = parseCatalogQuery(raw);
  const filtered = isFilteredQuery(query);
  const path = `/categories/${category.slug}`;
  const description =
    category.description || `خرید انواع ${category.name} با مشخصات، قیمت و موجودی به‌روز از ${SITE_NAME}.`;

  return {
    title: `خرید ${category.name}${query.page > 1 ? ` - صفحه ${query.page.toLocaleString("fa-IR")}` : ""}`,
    description,
    alternates: { canonical: query.page > 1 && !filtered ? `${path}?page=${query.page}` : path },
    robots: filtered ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: { type: "website", title: `خرید ${category.name} | ${SITE_NAME}`, description },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const [{ slug }, raw] = await Promise.all([params, searchParams]);
  const category = await findCategory(slug);
  if (!category) notFound();

  const path = `/categories/${category.slug}`;
  const query = parseCatalogQuery(raw);
  const result = await searchCatalog(query, { fixedCategory: category.name });

  const categoryLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: category.name,
        description: category.description || undefined,
        url: absoluteUrl(path),
        inLanguage: "fa-IR",
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: result.total,
          itemListElement: result.items.map((product, index) => ({
            "@type": "ListItem",
            position: (result.page - 1) * CATALOG_PAGE_SIZE + index + 1,
            url: absoluteUrl(`/products/${product.id}`),
            name: product.title,
          })),
        },
      },
      breadcrumbLd([
        { name: "خانه", path: "/" },
        { name: "فروشگاه", path: "/products" },
        { name: category.name, path },
      ]),
    ],
  };

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <JsonLd data={categoryLd} />
      <header className="mb-6">
        <p className="text-xs font-black text-[var(--primary)]">دسته‌بندی محصولات</p>
        <h1 className="mt-2 text-2xl font-black sm:text-3xl">{category.name}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">
          {category.description || `مشاهده محصولات دسته ${category.name}`}
        </p>
      </header>
      <CatalogView basePath={path} query={query} result={result} fixedCategory={category.name} />
    </div>
  );
}
