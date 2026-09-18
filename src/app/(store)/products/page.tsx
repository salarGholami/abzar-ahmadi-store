import type { Metadata } from "next";

import { CATALOG_PAGE_SIZE, isFilteredQuery, parseCatalogQuery, type RawSearchParams } from "@/domains/catalog/model/catalog-query";
import { searchCatalog } from "@/domains/catalog/server";
import CatalogView from "@/features/storefront/ui/catalog/CatalogView";
import JsonLd from "@/shared/seo/JsonLd";
import { SITE_NAME, absoluteUrl, breadcrumbLd } from "@/lib/seo";

type PageProps = { searchParams: Promise<RawSearchParams> };

const BASE_PATH = "/products";
const TITLE = "فروشگاه ابزار و تجهیزات ساختمانی";

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const query = parseCatalogQuery(await searchParams);
  const filtered = isFilteredQuery(query);
  const pageSuffix = query.page > 1 ? ` - صفحه ${query.page.toLocaleString("fa-IR")}` : "";

  return {
    title: query.q ? `نتایج جستجوی «${query.q}»` : `${TITLE}${pageSuffix}`,
    description: `مشاهده و خرید انواع ابزار و تجهیزات ساختمانی با قیمت شفاف، مشخصات کامل و موجودی به‌روز از ${SITE_NAME}.`,
    // Filtered / sorted / search URLs are duplicate content: keep them out of the index, keep links followed.
    alternates: { canonical: query.page > 1 && !filtered ? `${BASE_PATH}?page=${query.page}` : BASE_PATH },
    robots: filtered ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const query = parseCatalogQuery(await searchParams);
  const result = await searchCatalog(query);

  const listLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: TITLE,
        url: absoluteUrl(BASE_PATH),
        inLanguage: "fa-IR",
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: result.total,
          itemListElement: result.items.map((product, index) => ({
            "@type": "ListItem",
            position: (result.page - 1) * CATALOG_PAGE_SIZE + index + 1,
            url: absoluteUrl(`/products/${product.id}`),
            name: product.title,
            ...(product.image ? { image: absoluteUrl(product.image) } : {}),
          })),
        },
      },
      breadcrumbLd([
        { name: "خانه", path: "/" },
        { name: "فروشگاه", path: BASE_PATH },
      ]),
    ],
  };

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <JsonLd data={listLd} />
      <header className="mb-6">
        <h1 className="text-2xl font-black sm:text-3xl">{query.q ? `نتایج جستجوی «${query.q}»` : TITLE}</h1>
      </header>
      <CatalogView basePath={BASE_PATH} query={query} result={result} />
    </div>
  );
}
