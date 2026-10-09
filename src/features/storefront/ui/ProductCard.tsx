import type { Product } from "@/domains/catalog";
import ProductCardImage from "./product-card/ProductCardImage";
import ProductCardInfo from "./product-card/ProductCardInfo";

type ProductCardProps = { p: Product; compact?: boolean; priority?: boolean };

export default function ProductCard({ p, compact = false, priority = false }: ProductCardProps) {
  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-all duration-200 sm:rounded-2xl sm:hover:-translate-y-0.5 sm:hover:border-[var(--primary)]/25 sm:hover:shadow-lg">
      <ProductCardImage product={p} compact={compact} priority={priority} />
      <ProductCardInfo product={p} />
    </article>
  );
}
