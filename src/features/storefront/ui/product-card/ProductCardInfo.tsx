import { PackageCheck, Truck } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/domains/catalog";
import RatingStars from "../RatingStars";
import ProductCardCartControl from "./ProductCardCartControl";

export default function ProductCardInfo({ product }: { product: Product }) {
  const finalPrice = Math.round(product.price * (1 - product.discount / 100));
  const outOfStock = product.stock <= 0;

  return (
    <div className="flex flex-1 flex-col p-2.5 sm:p-4">
      <div className="mb-1.5 flex min-w-0 items-center justify-between gap-2">
        <span className="min-w-0 truncate text-[8px] font-bold text-[var(--muted)] sm:text-xs">{product.brand}</span>
        <span className="hidden shrink-0 rounded-md bg-[var(--surface-2)] px-1.5 py-1 font-mono text-[11px] text-[var(--muted)] sm:block">{product.sku}</span>
      </div>

      <Link href={`/products/${product.id}`} className="line-clamp-2 min-h-[40px] text-[12px] font-black leading-[1.75] tracking-tight text-[var(--text)] transition-colors hover:text-[var(--primary)] sm:min-h-[48px] sm:text-[15px] sm:leading-6">
        {product.title}
      </Link>

      <div className="mt-1.5 min-h-[17px] sm:mt-2">
        {product.rating ? <RatingStars rating={product.rating} reviewCount={product.reviewCount} size={10} /> : null}
      </div>

      <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[8px] font-bold text-[var(--muted)] sm:mt-3 sm:text-xs">
        <PackageCheck size={12} className={outOfStock ? "shrink-0 text-red-500" : "shrink-0 text-[var(--success)]"} />
        <span className="truncate">{outOfStock ? "ناموجود" : `موجودی ${product.stock.toLocaleString("fa-IR")} عدد`}</span>
      </div>

      {product.specs?.length ? (
        <div className="mt-2 hidden min-h-9 grid-cols-2 gap-x-2 gap-y-1 sm:grid">
          {product.specs.slice(0, 2).map((spec) => (
            <span key={`${product.id}-${spec.label}`} className="truncate text-[10px] font-medium text-[var(--muted)]">
              <b className="font-bold text-[var(--text)]">{spec.label}:</b> {spec.value}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-2 flex items-center gap-1.5 text-[9px] font-bold text-[var(--muted)] sm:text-[10px]">
        <Truck size={12} className="text-[var(--primary)]" />
        ارسال سریع
      </div>

      <div className="my-2 h-px bg-[var(--border)] sm:my-3" />

      <div className="mt-auto flex min-w-0 items-end justify-between gap-2">
        <div className="min-w-0">
          {product.discount > 0 ? <div className="truncate text-[7px] font-medium leading-4 text-[var(--muted)] line-through sm:text-xs">{product.price.toLocaleString("fa-IR")} تومان</div> : null}
          <div className="flex items-baseline gap-0.5 whitespace-nowrap text-[13px] font-black text-[var(--text)] sm:gap-1 sm:text-lg">
            <span>{finalPrice.toLocaleString("fa-IR")}</span>
            <span className="text-[7px] font-bold text-[var(--muted)] sm:text-xs">تومان</span>
          </div>
        </div>
        <ProductCardCartControl product={product} />
      </div>
    </div>
  );
}
