import type { Product } from "@/domains/catalog";
import ProductCard from "../ProductCard";

export default function FlashSaleProducts({ products }: { products: Product[] }) {
  return (
    <div className="scrollbar-none -mx-1 flex gap-3 overflow-x-auto px-1 pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-4 lg:gap-5">
      {products.map((product) => (
        <div key={product.id} className="w-[205px] min-w-[205px] shrink-0 sm:w-auto sm:min-w-0">
          <ProductCard p={product} compact />
        </div>
      ))}
    </div>
  );
}
