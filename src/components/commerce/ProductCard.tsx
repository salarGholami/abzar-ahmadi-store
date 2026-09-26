"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Minus, PackageCheck, Plus, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import RatingStars from "./RatingStars";

interface ProductCardProps {
  p: Product;
  compact?: boolean;
}

export default function ProductCard({ p, compact = false }: ProductCardProps) {
  const { add, setQty, lines } = useCart();

  const line = lines.find((item) => item.productId === p.id);
  const quantity = line?.qty ?? 0;

  const finalPrice = Math.round(p.price * (1 - p.discount / 100));

  const primaryImage =
    p.images?.[0]?.url || p.image || "/placeholder-product.svg";

  const secondaryImage = p.images?.[1]?.url;

  const isOutOfStock = p.stock <= 0;
  const reachedStockLimit = quantity >= p.stock;

  function handleAdd() {
    if (isOutOfStock || reachedStockLimit) {
      return;
    }
    add(p, 1);
  }

  function decrease() {
    if (!line) return;
    setQty(p.id, Math.max(0, line.qty - 1));
  }

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_2px_12px_rgba(0,0,0,0.035)] transition-all duration-300 sm:rounded-[22px] sm:hover:-translate-y-1 sm:hover:border-[var(--primary)]/20 sm:hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
      {/* =====================================================
          IMAGE
      ====================================================== */}
      <Link
        href={`/products/${p.id}`}
        className="block shrink-0"
        aria-label={`مشاهده ${p.title}`}
      >
        <div
          className={`relative overflow-hidden bg-[var(--surface-2)] ${
            compact ? "aspect-[1.1]" : "aspect-square"
          }`}
        >
          {/* MAIN IMAGE */}
          <Image
            src={primaryImage}
            alt={p.title}
            fill
            unoptimized
            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out sm:group-hover:scale-[1.045]"
          />

          {/* SECOND IMAGE */}
          {secondaryImage && (
            <Image
              src={secondaryImage}
              alt=""
              fill
              unoptimized
              aria-hidden="true"
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
              className="object-cover opacity-0 transition-opacity duration-500 sm:group-hover:opacity-100"
            />
          )}

          {/* IMAGE GRADIENT */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/25 to-transparent" />

          {/* =================================================
              DISCOUNT
          ================================================== */}
          {p.discount > 0 && (
            <span className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-1 text-[8px] font-black leading-none text-white shadow-md sm:right-3 sm:top-3 sm:px-2.5 sm:py-1.5 sm:text-[10px]">
              ٪{p.discount}
            </span>
          )}

          {/* =================================================
              OUT OF STOCK
          ================================================== */}
          {isOutOfStock && (
            <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[8px] font-black text-white backdrop-blur-md sm:left-3 sm:top-3 sm:px-2.5 sm:py-1.5 sm:text-[10px]">
              ناموجود
            </span>
          )}

          {/* =================================================
              IMAGE COUNT
          ================================================== */}
          {secondaryImage && (
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white/85 px-2 py-1 text-[7px] font-bold text-[var(--text)] backdrop-blur-md sm:hidden">
              ۲ تصویر
            </span>
          )}
        </div>
      </Link>

      {/* =====================================================
          CONTENT
      ====================================================== */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        {/* =================================================
            BRAND
        ================================================== */}
        <div className="mb-1.5 flex min-w-0 items-center justify-between gap-2">
          <span className="min-w-0 truncate text-[8px] font-bold text-[var(--muted)] sm:text-[10px]">
            {p.brand}
          </span>

          {/* SKU — فقط دسکتاپ */}
          <span className="hidden shrink-0 rounded-md bg-[var(--surface-2)] px-1.5 py-1 font-mono text-[9px] text-[var(--muted)] sm:block">
            {p.sku}
          </span>
        </div>

        {/* =================================================
            TITLE
        ================================================== */}
        <Link
          href={`/products/${p.id}`}
          className="line-clamp-2 min-h-[40px] text-[12px] font-black leading-[1.75] tracking-tight text-[var(--text)] transition-colors hover:text-[var(--primary)] sm:min-h-[48px] sm:text-[15px] sm:leading-6"
        >
          {p.title}
        </Link>

        {/* =================================================
            RATING
        ================================================== */}
        {p.rating ? (
          <div className="mt-1.5 flex min-h-[17px] items-center sm:mt-2">
            <RatingStars
              rating={p.rating}
              reviewCount={p.reviewCount}
              size={10}
            />
          </div>
        ) : (
          <div className="mt-1.5 h-[17px] sm:mt-2" />
        )}

        {/* =================================================
            STOCK
        ================================================== */}
        <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[8px] font-bold text-[var(--muted)] sm:mt-3 sm:text-[10px]">
          <PackageCheck
            size={12}
            className={
              isOutOfStock
                ? "shrink-0 text-red-500"
                : "shrink-0 text-[var(--success)]"
            }
          />
          <span className="truncate">
            {isOutOfStock
              ? "ناموجود"
              : `موجودی ${p.stock.toLocaleString("fa-IR")} عدد`}
          </span>
        </div>

        {/* =================================================
            DIVIDER
        ================================================== */}
        <div className="my-2 h-px bg-[var(--border)] sm:my-3" />

        {/* =================================================
            BOTTOM
        ================================================== */}
        <div className="mt-auto flex min-w-0 items-end justify-between gap-2">
          {/* =================================================
              PRICE
          ================================================== */}
          <div className="min-w-0">
            {p.discount > 0 && (
              <div className="truncate text-[7px] font-medium leading-4 text-[var(--muted)] line-through sm:text-[10px]">
                {p.price.toLocaleString("fa-IR")} تومان
              </div>
            )}

            <div className="flex items-baseline gap-0.5 whitespace-nowrap text-[13px] font-black text-[var(--text)] sm:gap-1 sm:text-lg">
              <span>{finalPrice.toLocaleString("fa-IR")}</span>
              <span className="text-[7px] font-bold text-[var(--muted)] sm:text-[10px]">
                تومان
              </span>
            </div>
          </div>

          {/* =================================================
              CART
          ================================================== */}
          {quantity > 0 ? (
            <div className="flex h-9 shrink-0 items-center overflow-hidden rounded-[10px] bg-[var(--primary)] text-white shadow-md sm:h-11 sm:rounded-xl">
              <button
                type="button"
                onClick={decrease}
                className="grid size-7 place-items-center transition hover:bg-black/10 active:bg-black/20 sm:size-10"
                aria-label="کاهش تعداد"
              >
                <Minus size={13} />
              </button>

              <span
                className="min-w-5 text-center text-[10px] font-black tabular-nums sm:min-w-7 sm:text-xs"
                aria-label={`تعداد ${quantity}`}
              >
                {quantity.toLocaleString("fa-IR")}
              </span>

              <button
                type="button"
                onClick={handleAdd}
                disabled={reachedStockLimit}
                className="grid size-7 place-items-center transition hover:bg-black/10 active:bg-black/20 disabled:cursor-not-allowed disabled:opacity-40 sm:size-10"
                aria-label="افزایش تعداد"
              >
                <Plus size={13} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              disabled={isOutOfStock}
              className="group/cart flex h-9 shrink-0 items-center justify-center gap-1 rounded-[10px] bg-[var(--primary)] px-2.5 text-[9px] font-black text-white shadow-md shadow-[var(--primary)]/15 transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-2)] active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:bg-[var(--muted)] disabled:opacity-50 sm:h-11 sm:gap-1.5 sm:rounded-xl sm:px-3.5 sm:text-xs"
              aria-label={isOutOfStock ? "محصول ناموجود" : "افزودن به سبد"}
            >
              {isOutOfStock ? (
                <Check size={13} />
              ) : (
                <ShoppingCart
                  size={14}
                  className="transition-transform duration-200 group-hover/cart:scale-110 sm:size-[15px]"
                />
              )}

              {/* متن فقط از sm به بالا نمایش داده می‌شود */}
              <span className="hidden sm:inline">
                {isOutOfStock ? "ناموجود" : "افزودن"}
              </span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
