import Link from "next/link";
import type { Product } from "@/lib/types";

export default function BrandStrip({ brands }: { brands: string[] }) {
  if (!brands.length) return null;

  return (
    <section className="mx-auto max-w-[1500px] px-4 py-6 lg:px-6">
      <div className="card flex flex-wrap items-center justify-center gap-3 p-6 sm:justify-between">
        {brands.map((brand) => (
          <Link
            key={brand}
            href={`/products?brand=${encodeURIComponent(brand)}`}
            className="rounded-xl px-4 py-2 text-sm font-black text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--primary)]"
          >
            {brand}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function topBrandsFromProducts(products: Product[], limit = 8): string[] {
  const counts = new Map<string, number>();
  for (const product of products) {
    if (!product.brand) continue;
    counts.set(product.brand, (counts.get(product.brand) || 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([brand]) => brand);
}
