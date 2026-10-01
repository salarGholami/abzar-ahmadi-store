import type { Product } from "@/domains/catalog";
import ProductCardImage from "./product-card/ProductCardImage";
import ProductCardInfo from "./product-card/ProductCardInfo";

type ProductCardProps = { p: Product; compact?: boolean; priority?: boolean };

export default function ProductCard({ p, compact = false, priority = false }: ProductCardProps) {
  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_2px_12px_rgba(0,0,0,0.035)] transition-all duration-300 sm:rounded-[22px] sm:hover:-translate-y-1 sm:hover:border-[var(--primary)]/20 sm:hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
      <ProductCardImage product={p} compact={compact} priority={priority} />
      <ProductCardInfo product={p} />
    </article>
  );
}
