import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/types";

export default function ProductRow({
  title,
  subtitle,
  icon: Icon,
  products,
  viewAllHref,
  accent = "default",
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  products: Product[];
  viewAllHref?: string;
  accent?: "default" | "danger";
}) {
  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-[1500px] px-4 py-8 lg:px-6">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <div className={`flex items-center gap-2 text-xs font-black ${accent === "danger" ? "text-red-500" : "text-[var(--primary)]"}`}>
            {Icon && <Icon size={15} />}
            {subtitle}
          </div>
          <h2 className="mt-1 text-2xl font-black">{title}</h2>
        </div>
        {viewAllHref && (
          <Link href={viewAllHref} className="flex shrink-0 items-center gap-1 text-sm font-black text-[var(--primary)]">
            مشاهده همه <ArrowLeft size={15} />
          </Link>
        )}
      </div>

      <div className="scrollbar-none -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <div key={product.id} className="w-[76vw] shrink-0 sm:w-auto">
            <ProductCard p={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
