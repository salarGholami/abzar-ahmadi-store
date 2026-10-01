import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/domains/catalog";

type ProductCardImageProps = {
  product: Product;
  compact: boolean;
  priority?: boolean;
};

export default function ProductCardImage({ product, compact, priority = false }: ProductCardImageProps) {
  const primaryImage = product.images?.[0]?.url || product.image || "/placeholder-product.svg";
  const secondaryImage = product.images?.[1]?.url;

  return (
    <Link href={`/products/${product.id}`} className="block shrink-0" aria-label={`مشاهده ${product.title}`}>
      <div className={`relative overflow-hidden bg-[var(--surface-2)] ${compact ? "aspect-[1.1]" : "aspect-square"}`}>
        <Image
          src={primaryImage}
          alt={product.title}
          fill
          priority={priority}
          sizes="(max-width: 639px) 50vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 ease-out sm:group-hover:scale-[1.045]"
        />
        {secondaryImage ? (
          <Image
            src={secondaryImage}
            alt=""
            fill
            aria-hidden="true"
            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
            className="object-cover opacity-0 transition-opacity duration-500 sm:group-hover:opacity-100"
          />
        ) : null}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/25 to-transparent" />
        {product.discount > 0 ? (
          <span className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-1 text-[8px] font-black leading-none text-white shadow-md sm:right-3 sm:top-3 sm:px-2.5 sm:py-1.5 sm:text-[10px]">
            ٪{product.discount}
          </span>
        ) : null}
        {product.stock <= 0 ? (
          <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[8px] font-black text-white backdrop-blur-md sm:left-3 sm:top-3 sm:px-2.5 sm:py-1.5 sm:text-[10px]">
            ناموجود
          </span>
        ) : null}
        {secondaryImage ? (
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white/85 px-2 py-1 text-[7px] font-bold text-[var(--text)] backdrop-blur-md sm:hidden">
            ۲ تصویر
          </span>
        ) : null}
      </div>
    </Link>
  );
}
