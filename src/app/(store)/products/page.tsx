import StoreHeader from "@/components/layout/StoreHeader";
import StoreFooter from "@/components/commerce/StoreFooter";
import ProductsBrowser from "@/components/commerce/ProductsBrowser";
import { getProducts } from "@/lib/data";

export default async function Products({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const [products, sp] = await Promise.all([getProducts(), searchParams]);
  return (
    <>
      <StoreHeader />
      <main className="mx-auto max-w-[1400px] px-4 py-10 lg:px-6">
        <ProductsBrowser products={products} initialCategory={sp.category} />
      </main>
      <StoreFooter />
    </>
  );
}
