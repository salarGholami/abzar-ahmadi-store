import ProductsBrowser from "@/components/commerce/ProductsBrowser";
import { getProducts } from "@/lib/data";
import type { Category } from "@/lib/types";
import { getJson } from "@/lib/github";

export default async function Products({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; brand?: string; q?: string }>;
}) {
  const [products, sp, categoryResult] = await Promise.all([
    getProducts(),
    searchParams,
    getJson<Category[]>("categories.json", []),
  ]);

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-8">
      <ProductsBrowser
        products={products}
        categories={categoryResult.data}
        initialCategory={sp.category}
        initialBrand={sp.brand}
        initialQuery={sp.q}
      />
    </div>
  );
}
