import type { Product } from "@/domains/catalog";
import ProductCard from "../ProductCard";

const PRIORITY_COUNT = 4;

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <li key={product.id} className="min-w-0">
          <ProductCard p={product} priority={index < PRIORITY_COUNT} />
        </li>
      ))}
    </ul>
  );
}
